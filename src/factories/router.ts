import * as express from 'express';
import {inject, injectable, factory, provider, activate, Injector} from '@ziggurat/tiamat';
import {MiddlewareConfig, MiddlewareProvider, RouterConfig,
  RouterMethodMeta} from '../decorators';
import {MiddlewareFactory} from './middleware';

@injectable()
export class BaseRouterFactory {
  @inject('tashmetu.MiddlewareFactory') protected mwf: MiddlewareFactory;

  protected createHandler(config: MiddlewareConfig): express.RequestHandler {
    if (config.handler) {
      return config.handler;
    } else if (config.provider) {
      return this.mwf.createRequestHandler(config.provider);
    } else {
      throw new Error('Middleware must have either a handler or a provider');
    }
  }

  protected applyDecorators(router: express.Router) {
    const config: RouterConfig = Reflect.getOwnMetadata(
      'tashmetu:router', this.constructor);
    if (config && config.middleware) {
      for (const middlewareConfig of config.middleware) {
        router.use(middlewareConfig.path, this.createHandler(middlewareConfig));
      }
    }

    let methods: RouterMethodMeta[] = Reflect.getOwnMetadata(
      'tashmetu:router-method', this.constructor) || [];
    methods.forEach((metadata: any) => {
      if (metadata.data.middleware) {
        metadata.data.middleware.forEach((mw: any) => {
          router.get(metadata.data.path, this.createHandler(mw));
        });
      }
      router.get(metadata.data.path, this.mwf.createMethodRequestHandler(this, metadata.key));
    });
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
