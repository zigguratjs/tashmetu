import {inject, provider, factory} from '@ziggurat/tiamat';
import * as express from 'express';
import * as http from 'http';

@provider({
  key: 'tashmetu.HttpServerFactory'
})
export class HttpServerFactory {
  @inject('express.Application') private app: express.Application;

  @factory({key: 'http.Server'})
  public httpServer(): http.Server {
    return http.createServer(this.app);
  }
}
