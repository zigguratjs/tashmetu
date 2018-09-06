import * as express from 'express';
import {injectable} from '@ziggurat/tiamat';
import {RouterFactory} from './router';

@injectable()
export class ServerFactory extends RouterFactory {
  public app(): express.Application {
    const app = express();
    this.applyDecorators(app);
    return app;
  }
}
