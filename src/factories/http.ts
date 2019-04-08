import {factory} from '@ziggurat/tiamat';
import * as express from 'express';
import * as http from 'http';

export class HttpServerFactory {
  @factory({
    key: 'http.Server',
    inject: ['express.Application']
  })
  public httpServer(app: express.Application): http.Server {
    return http.createServer(app);
  }
}
