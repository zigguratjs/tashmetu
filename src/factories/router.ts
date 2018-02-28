import * as express from 'express';
import {inject, injectable, factory, provider, activate, Injector} from '@ziggurat/tiamat';
import {MiddlewareConfig, MiddlewareProvider, RouterConfig,
  RouterMethodMeta, RouterMethodMiddlewareMeta, RouterFactoryProvider} from '../decorators';
import {filter, reverse} from 'lodash';

@injectable()
export class BaseRouterFactory {
  @inject('tiamat.Injector') private injector: Injector;

  protected createHandler(config: MiddlewareConfig): express.RequestHandler {
    if (config.handler) {
      return config.handler;
    } else if (config.provider) {
      return config.provider(this.injector);
    } else if (config.router) {
      if (typeof config.router === 'string') {
        return this.injector.get<any>(config.router).router();
      } else {
        return config.router(this.injector).router();
      }
    } else {
      throw new Error('Middleware must have a handler, provider or router');
    }
  }

  protected applyDecorators(router: express.Router) {
    const config: RouterConfig = Reflect.getOwnMetadata(
      'tashmetu:router', this.constructor);
    if (config && config.middleware) {
      for (let middlewareConfig of config.middleware) {
        router.use(middlewareConfig.path, this.createHandler(middlewareConfig));
      }
    }

    const methods: RouterMethodMeta[] = Reflect.getOwnMetadata(
      'tashmetu:router-method', this.constructor) || [];
    const middleware: RouterMethodMiddlewareMeta<Function>[] = Reflect.getOwnMetadata(
      'tashmetu:router-method-middleware', this.constructor) || [];
    for (let method of methods) {
      this.addMethod(method, router, reverse(filter(middleware, {key: method.key})));
    }
  }

  protected createMethodRequestHandler(controller: any, key: string): express.RequestHandler {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const result: any = controller[key](req, res, next);
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

  private addMethod(
    config: RouterMethodMeta,
    router: express.Router,
    middlewares: RouterMethodMiddlewareMeta<Function>[]
  ) {
    function addRequestHandler(handler: express.RequestHandler) {
      (<any>router)[config.method](config.data, handler);
    }
    for (let middleware of middlewares || []) {
      if (middleware.isProvider) {
        addRequestHandler(middleware.data(this.injector));
      } else {
        addRequestHandler(<express.RequestHandler>middleware.data);
      }
    }
    addRequestHandler(this.createMethodRequestHandler(this, config.key));
  }
}

@injectable()
export class RouterFactory extends BaseRouterFactory {
  public router(): express.Router {
    let router = express.Router();
    this.applyDecorators(router);
    return router;
  }
}
