import * as express from 'express';
import {inject, injectable, factory, provider, activate, Injector} from '@ziggurat/tiamat';
import {MiddlewareConfig, MiddlewareProvider, RouterConfig,
  RouterMethodMeta, RouterFactoryProvider} from '../decorators';

@injectable()
export class BaseRouterFactory {
  @inject('tiamat.Injector') private injector: Injector;

  protected createHandler(config: MiddlewareConfig): express.RequestHandler {
    if (config.handler) {
      return config.handler;
    } else if (config.provider) {
      return config.provider(this.injector);
    } else if (config.factory) {
      if (typeof config.factory === 'string') {
        return this.injector.get<any>(config.factory).router();
      } else {
        return config.factory(this.injector).router();
      }
    } else {
      throw new Error('Middleware must have either a handler or a provider');
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
    for (let config of methods) {
      for (let mw of config.data.middleware || []) {
        router.use(config.data.path, this.createHandler(mw));
      }
      let requestHandler = this.createMethodRequestHandler(this, config.key);
      (<any>router)[config.method](config.data.path, requestHandler);
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
}

@injectable()
export class RouterFactory extends BaseRouterFactory {
  public router(): express.Router {
    let router = express.Router();
    this.applyDecorators(router);
    return router;
  }
}
