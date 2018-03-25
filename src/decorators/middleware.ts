import {Injector} from '@ziggurat/tiamat';
import * as express from 'express';
import {MiddlewareProvider, MiddlewareConfig} from './interfaces';
import {RouterFactory} from '../factories/router';

export class RouterSetupAnnotation {
  public setup(factory: RouterFactory, router: express.Router, injector: Injector) {
    return;
  }
}

export class MiddlewareAnnotation extends RouterSetupAnnotation {
  public constructor(
    private config: MiddlewareConfig[]
  ) { super(); }

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

  public setup(factory: RouterFactory, router: express.Router, injector: Injector) {
    for (let mw of this.config || []) {
      router.use(mw.path, this.createHandler(mw, injector));
    }
  }
}
