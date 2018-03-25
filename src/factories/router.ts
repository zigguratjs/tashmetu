import {getType} from 'reflect-helper';
import * as express from 'express';
import {inject, injectable, Injector} from '@ziggurat/tiamat';
import {RouterSetupAnnotation} from '../decorators/middleware';
import {RouterMethodAnnotation} from '../decorators/method';

@injectable()
export class RouterFactory {
  @inject('tiamat.Injector') private injector: Injector;

  public router(): express.Router {
    let router = express.Router();
    this.applyDecorators(router);
    return router;
  }

  protected applyDecorators(router: express.Router) {
    for (let annotation of getType(this.constructor).getAnnotations(RouterSetupAnnotation)) {
      annotation.setup(this, router, this.injector);
    }
    for (let annotation of getType(this.constructor).getAnnotations(RouterMethodAnnotation, true)) {
      annotation.setup(this, router, this.injector);
    }
  }
}
