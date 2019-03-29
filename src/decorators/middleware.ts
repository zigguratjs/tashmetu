import {Annotation} from '@ziggurat/meta';
import {Container} from '@ziggurat/tiamat';
import * as express from 'express';
import {MiddlewareConfig} from './interfaces';
import {RouterFactory} from '../factories/router';

export class RouterSetupAnnotation extends Annotation {
  public setup(factory: RouterFactory, router: express.Router, container: Container) {
    return;
  }
}

export class MiddlewareAnnotation extends RouterSetupAnnotation {
  public constructor(
    private config: MiddlewareConfig[]
  ) { super(); }

  public setup(factory: RouterFactory, router: express.Router, container: Container) {
    for (let mw of this.config || []) {
      router.use(mw.path, mw.producer(container));
    }
  }
}
