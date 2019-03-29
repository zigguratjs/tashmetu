import {factory, provider} from '@ziggurat/tiamat';
import * as express from 'express';
import * as http from 'http';

@provider({
  inject: ['express.Application']
})
export class HttpServerFactory {
  constructor(
    private app: express.Application
  ) {}

  @factory({key: 'http.Server'})
  public httpServer(): http.Server {
    return http.createServer(this.app);
  }
}
