import {ClassDecorator, Injector} from '@ziggurat/tiamat';
import {RouterConfig, MiddlewareProvider, MiddlewareConfig} from './interfaces';
import {RouterMeta} from './meta';
import * as express from 'express';

export class RouterDecorator extends ClassDecorator<RouterConfig> {
  protected createHandler(config: MiddlewareConfig, injector: Injector): express.RequestHandler {
    if (config.handler) {
      return config.handler;
    } else if (config.provider) {
      return config.provider(injector);
    } else if (config.router) {
      if (typeof config.router === 'string') {
        return injector.get<any>(config.router).router();
      } else {
        return config.router(injector).router();
      }
    } else {
      throw new Error('Middleware must have a handler, provider or router');
    }
  }

  public decorate(config: RouterConfig, target: any) {
    this.appendMeta('tiamat:tags', 'tashmetu.Router', target);
    for (let mwConfig of config.middleware || []) {
      RouterMeta.get(target).onSetup((router, injector) => {
        router.use(mwConfig.path, this.createHandler(mwConfig, injector));
      });
    }
  }
}
