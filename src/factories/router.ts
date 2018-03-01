import * as express from 'express';
import {inject, injectable, Injector} from '@ziggurat/tiamat';
import {RouterConfig, MiddlewareConfig} from '../decorators/interfaces';
import {RouterMeta} from '../decorators/meta';

@injectable()
export class Factory {
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

    RouterMeta.get(this.constructor)
      .setup(router, this.injector);
  }
}

@injectable()
export class RouterFactory extends Factory {
  public router(): express.Router {
    let router = express.Router();
    this.applyDecorators(router);
    return router;
  }
}
