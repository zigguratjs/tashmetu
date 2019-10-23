import {Annotation, Container, Producer} from '@ziggurat/tiamat';
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
    private config: MiddlewareConfig
  ) { super(); }

  public setup(factory: RouterFactory, router: express.Router, container: Container) {
    for (let path of Object.keys(this.config)) {
      const producers = ([] as Producer<express.RequestHandler>[]).concat(this.config[path]);
      router.use(path, ...producers.map(producer => producer(container)));
    }
  }
}
