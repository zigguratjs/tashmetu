import {Annotation, Container} from '@ziggurat/tiamat';
import {MiddlewareConfig} from '../interfaces';
import {Router} from '../router';

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
    router.applyMiddleware(this.config, container);
  }
}
