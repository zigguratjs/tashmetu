import * as express from 'express';
import {inject, injectable, factory} from '@ziggurat/tiamat';
import {MiddlewareConfig, RouterConfig} from '../decorators';
import {Factory} from './router';

@injectable()
export class ServerFactory extends Factory {
  public app(): express.Application {
    const app = express();
    this.applyDecorators(app);
    return app;
  }
}
