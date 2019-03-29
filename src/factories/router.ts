import * as express from 'express';
import {Container} from '@ziggurat/tiamat';
import {RouterSetupAnnotation} from '../decorators/middleware';
import {RouterMethodAnnotation} from '../decorators/method';

export class RouterFactory {
  public router(container: Container): express.Router {
    let router = express.Router();
    this.applyDecorators(router, container);
    return router;
  }

  protected applyDecorators(router: express.Router, container: Container) {
    for (let annotation of RouterSetupAnnotation.onClass(this.constructor)) {
      annotation.setup(this, router, container);
    }
    for (let annotation of RouterMethodAnnotation.onClass(this.constructor, true)) {
      annotation.setup(this, router, container);
    }
  }
}
