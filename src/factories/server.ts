import * as express from 'express';
import {injectable, factory} from '@ziggurat/tiamat';
import {Factory} from './router';

@injectable()
export class ServerFactory extends Factory {
  public app(): express.Application {
    const app = express();
    this.applyDecorators(app);
    return app;
  }
}
