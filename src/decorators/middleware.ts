import {Annotation, Container} from '@ziggurat/tiamat';
import {MiddlewareConfig} from '../interfaces';
import {Router} from '../factories/router';
import {configureRouter} from '../middleware';

export class RouterSetupAnnotation extends Annotation {
  public setup(router: Router, container: Container) {
    return;
  }
}

export class MiddlewareAnnotation extends RouterSetupAnnotation {
  public constructor(
    private config: MiddlewareConfig
  ) { super(); }

  public setup(router: Router, container: Container) {
    configureRouter(router.expressRouter, this.config, container);
  }
}
