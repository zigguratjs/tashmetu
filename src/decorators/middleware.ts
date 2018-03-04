import {ClassDecorator, Injector} from '@ziggurat/tiamat';
import {MiddlewareProvider, MiddlewareConfig} from './interfaces';
import {RouterMeta} from './meta';
import * as express from 'express';

export class MiddlewareDecorator extends ClassDecorator<MiddlewareConfig[]> {
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

  public decorate(config: MiddlewareConfig[], target: any) {
    for (let mw of config || []) {
      RouterMeta.get(target).onSetup((factory, router, injector) => {
        router.use(mw.path, this.createHandler(mw, injector));
      });
    }
  }
}
