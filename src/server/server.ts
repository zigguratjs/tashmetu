import * as express from 'express';
import {inject, injectable, service, Provider, Activator} from '@samizdatjs/tiamat';
import {Middleware, RouterProvider} from './interfaces';

@service({
  name: 'tashmetu.Server',
  singleton: true
})
export class Server implements Activator<any> {
  @inject('tiamat.Provider') private provider: Provider;

  private expressApp: express.Application = express();

  public listen(port: number): void {
    this.expressApp.listen(port);
  }

  public app(): express.Application {
    return this.expressApp;
  }

  public addMiddleware(controller: Middleware): void {
    this.expressApp.use(controller.apply);
  }

  public addRouter(controller: any, path: string): void {
    let router: express.Router = express.Router();
    this.addRouterMethods(controller, router);
    this.expressApp.use(path, router);
  }

  public addRouterMethods(entity: any, _router?: express.Router) {
    let router = _router || this.expressApp;
    let methodMetadata = Reflect.getOwnMetadata(
      'tashmetu:router-method', entity.constructor
    );
    if (methodMetadata) {
      methodMetadata.forEach((metadata: any) => {
        let handler: express.RequestHandler = this.handlerFactory(entity, metadata.key);
        router.get(metadata.path, handler);
      });
    }
  }

  public activate(router: any): any {
    let config = Reflect.getOwnMetadata('tashmetu:router', router.constructor);
    if (config.middleware) {
      config.middleware.forEach((name: any) => {
        let middleware = this.provider.get<Middleware>(name);
        this.addMiddleware(middleware);
      });
    }
    if (config.routes) {
      for (let path in config.routes) {
        if (config.routes[path]) {
          if (config.routes[path] instanceof Function) {
            this.expressApp.use(path, config.routes[path]);
          } else {
            let r = config.routes[path].createRouter(this.provider);
            this.addRouter(r, path);
          }
        }
      }
    }
    this.addRouterMethods(router);
    return router;
  }

  private handlerFactory(controller: any, key: string): express.RequestHandler {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      let result: any = controller[key](req, res, next);
      // try to resolve promise
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
}
