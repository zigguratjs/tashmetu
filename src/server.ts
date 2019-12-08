import * as express from 'express';
import * as http from 'http';
import {AddressInfo} from 'net';
import {provider, Optional, resolveInstance} from '@ziggurat/tiamat';
import {RouterAnnotation} from './decorators/middleware';
import {Route, Server, makeRoutes, RequestHandlerFactory, ControllerFactory} from './interfaces';
import {SocketGateway} from './gateway';
import {Middleware, ServerConfig} from './interfaces';

@provider({
  key: 'tashmetu.Server',
  inject: [
    'express.Application',
    'http.Server',
    'tashmetu.SocketGateway',
    Optional.of('tashmetu.ServerConfig'),
  ]
})
export class TashmetuServer implements Server {
  public constructor(
    private app: express.Application,
    private server: http.Server,
    private gateway: SocketGateway,
    config?: ServerConfig,
  ) {
    if (config) {
      this.mountRoutes(this.app, makeRoutes(config.middleware));
    }
  }

  public mount(route: Route) {
    this.mountRoutes(this.app, [route]);
  }

  public listen(port: number): http.Server {
    return this.server.listen(port);
  }

  public address(): string | AddressInfo | null {
    return this.server.address();
  }

  private createRouter(controller: any, path: string): express.Router {
    let routes: Route[] = [];

    for (let annotation of RouterAnnotation.onClass(controller.constructor, true)) {
      routes = routes.concat(annotation.routes(controller));
    }
    this.gateway.register(controller, {namespace: path});

    return this.mountRoutes(express.Router(), routes);
  }

  private mountRoutes(router: express.Router, routes: Route[]): express.Router {
    for (let route of routes) {
      const handlers = this.createHandlers(route.handlers, route.path || '/')
        .map(h => this.createAsyncHandler(h));

      if (route.method) {
        (<any>router)[route.method](route.path, handlers);
      } else if (route.path) {
        router.use(route.path, handlers);
      } else {
        router.use(handlers);
      }
    }
    return router;
  }

  private createAsyncHandler(handler: express.RequestHandler): express.RequestHandler  {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const result: any = handler(req, res, next);
      if (result && result instanceof Promise) {
        result.then((value: any) => {
          if (value && !res.headersSent) {
            res.send(value);
          }
        })
        .catch((error: any) => {
          next(error);
        });
      } else if (result && !res.headersSent) {
        res.send(result);
      }
    };
  }

  private createHandlers(middleware: Middleware, path: string): express.RequestHandler[] {
    if (Array.isArray(middleware)) {
      return middleware.map(m => m instanceof RequestHandlerFactory ? m.create() : m);
    }
    if (middleware instanceof ControllerFactory) {
      return [this.createRouter(middleware.create(), path)];
    }
    return [this.createRouter(resolveInstance(middleware), path)];
  }
}
