import {inject, factory} from '@ziggurat/tiamat';
import * as express from 'express';
import * as http from 'http';

export class HttpServerFactory {
  @inject('express.Application') private app: express.Application;

  @factory({key: 'http.Server'})
  public httpServer(): http.Server {
    return http.createServer(this.app);
  }
}
