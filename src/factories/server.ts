import * as express from 'express';
import {inject, injectable, factory} from '@ziggurat/tiamat';
import {MiddlewareConfig, RouterConfig, RouterMethodMeta} from '../decorators';
import {MiddlewareFactory} from './middleware';
import {BaseRouterFactory} from './router';

@injectable()
export class ServerFactory extends BaseRouterFactory {

  @factory({key: 'express.Application'})
  public app(): express.Application {
    const app = express();
    this.applyDecorators(app);
    return app;
  }
}
