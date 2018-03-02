import * as express from 'express';
import {inject, injectable, Injector} from '@ziggurat/tiamat';
import {RouterMeta} from '../decorators/meta';

@injectable()
export class RouterFactory {
  @inject('tiamat.Injector') private injector: Injector;

  public router(): express.Router {
    let router = express.Router();
    this.applyDecorators(router);
    return router;
  }

  protected applyDecorators(router: express.Router) {
    RouterMeta.get(this.constructor).setup(router, this.injector);
  }
}
