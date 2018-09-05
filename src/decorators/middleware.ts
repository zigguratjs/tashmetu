import {Injector} from '@ziggurat/tiamat';
import * as express from 'express';
import {MiddlewareConfig} from './interfaces';
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

  public setup(factory: RouterFactory, router: express.Router, injector: Injector) {
    for (let mw of this.config || []) {
      router.use(mw.path, mw.provider(injector));
    }
  }
}
