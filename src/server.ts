import * as express from 'express';
import * as http from 'http';
import {AddressInfo} from 'net';
import {provider, Container, Optional, Resolver} from '@ziggurat/tiamat';
import {RouterAnnotation} from './decorators/middleware';
import {Route, Server, makeRoutes} from './interfaces';
import {SocketGateway} from './gateway';
import {ServerConfig} from './interfaces';

@provider({
  key: 'tashmetu.Server',
  inject: [
    'express.Application',
    'http.Server',
    'tiamat.Container',
    'tashmetu.SocketGateway',
    Optional.of('tashmetu.ServerConfig'),
  ]
})
export class TashmetuServer implements Server {
  public constructor(
    private app: express.Application,
    private server: http.Server,
    private container: Container,
    private gateway: SocketGateway,
    config: ServerConfig | undefined,
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
      const handlers = route.handlers.map((h: any) => this.createHandler(h, route.path || '/'));

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

  private createHandler(handler: any, path: string): express.RequestHandler {
    if (handler instanceof Resolver) {
      return this.createHandler(handler.resolve(this.container), path);
    }
    if (typeof handler === 'function') {
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
    return this.createRouter(handler, path);
  }
}
