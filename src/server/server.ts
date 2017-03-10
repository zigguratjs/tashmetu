import * as express from 'express';
import {inject, provider, Injector, Activator} from '@samizdatjs/tiamat';
import {MiddlewareConfig} from './interfaces';

@provider({
  for: 'tashmetu.Server',
  singleton: true
})
export class Server implements Activator<any> {
  @inject('tiamat.Injector') private injector: Injector;

  private _app: express.Application = express();

  public listen(port: number): void {
    this._app.listen(port);
  }

  public app(): express.Application {
    return this._app;
  }

  public activate(router: any): any {
    let config = Reflect.getOwnMetadata('tashmetu:router', router.constructor);
    if (config.middleware) {
      config.middleware.forEach((middlewareConfig: MiddlewareConfig) => {
        this.addMiddleware(middlewareConfig);
      });
    }
    if (config.routes) {
      for (let path in config.routes) {
        if (config.routes[path]) {
          if (config.routes[path] instanceof Function) {
            this._app.use(path, config.routes[path]);
          } else {
            let r = config.routes[path].createRouter(this.injector);
            this.addRouter(r, path);
          }
        }
      }
    }
    this.addRouterMethods(router);
    return router;
  }

  private addRouter(controller: any, path: string): void {
    let router: express.Router = express.Router();
    this.addRouterMethods(controller, router);
    this._app.use(path, router);
  }

  private addRouterMethods(entity: any, _router?: express.Router) {
    let router = _router || this._app;
    let methodMetadata = Reflect.getOwnMetadata(
      'tashmetu:router-method', entity.constructor
    );
    let middlewareMetadata = Reflect.getOwnMetadata(
      'tashmetu:router-middleware', entity.constructor
    );
    if (methodMetadata) {
      methodMetadata.forEach((metadata: any) => {
        if (metadata.config.middleware) {
          metadata.config.middleware.forEach((mw: any) => {
            router.get(metadata.config.path, this.createHandler(mw));
          });
        }
        let handler: express.RequestHandler = this.handlerFactory(entity, metadata.key);
        router.get(metadata.config.path, handler);
      });
    }
  }

  private addMiddleware(config: MiddlewareConfig): void {
    this._app.use(config.path, this.createHandler(config));
  }

  private createHandler(mw: any): express.RequestHandler {
    if (mw.handler) {
      return mw.handler;
    } else {
      return mw.provider(this.injector);
    }
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
