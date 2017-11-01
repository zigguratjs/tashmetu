import * as express from 'express';
import {inject, provider, activate, Injector} from '@ziggurat/tiamat';
import {MiddlewareConfig, RouterConfig, RouterMethodMeta} from './decorators';

@provider({
  for: 'tashmetu.Server',
  singleton: true
})
export class Server {
  @inject('tiamat.Injector') private injector: Injector;
  @inject('express.Application') private expressApp: express.Application;

  @activate('tashmetu.Router')
  public activate(router: any): any {
    let config: RouterConfig = Reflect.getOwnMetadata(
      'tashmetu:router', router.constructor);
    if (config.middleware) {
      config.middleware.forEach((middlewareConfig: MiddlewareConfig) => {
        this.addMiddleware(middlewareConfig);
      });
    }
    if (config.routes) {
      config.routes.forEach((route: any) => {
        this.addRouter(this.getProviderInstance(route.provider), route.path);
      });
    }
    this.addRouterMethods(router);
    return router;
  }

  private getProviderInstance(p: string | Function): any {
    if (typeof p === 'string') {
      return this.injector.get(p);
    } else {
      return p(this.injector);
    }
  }

  private addRouter(controller: any, path: string): void {
    let router: express.Router = express.Router();
    this.addRouterMethods(controller, router);
    this.expressApp.use(path, router);
  }

  private addRouterMethods(entity: any, _router?: express.Router) {
    let router = _router || this.expressApp;
    let methods: RouterMethodMeta[] = Reflect.getOwnMetadata(
      'tashmetu:router-method', entity.constructor) || [];
    methods.forEach((metadata: any) => {
      if (metadata.data.middleware) {
        metadata.data.middleware.forEach((mw: any) => {
          router.get(metadata.data.path, this.createHandler(mw));
        });
      }
      let handler: express.RequestHandler = this.handlerFactory(entity, metadata.key);
      router.get(metadata.data.path, handler);
    });
  }

  private addMiddleware(config: MiddlewareConfig): void {
    this.expressApp.use(config.path, this.createHandler(config));
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
