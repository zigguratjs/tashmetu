import * as express from 'express';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import {provider, Container, Optional} from '@ziggurat/tiamat';
import {ServerConfig} from './interfaces';
import {configureRouter} from './middleware';

@provider({
  key: 'tashmetu.Server',
  inject: [
    'express.Application',
    'http.Server',
    'socket.io.Server',
    'tiamat.Container',
    Optional.of('tashmetu.ServerConfig'),
  ]
})
export class Server {
  public constructor(
    public app: express.Application,
    public server: http.Server,
    public socket: SocketIO.Server,
    container: Container,
    config: ServerConfig | undefined,
  ) {
    if (config) {
      configureRouter(app, config.middleware, container);
    }
  }

  public listen(port: number) {
    this.server.listen(port);
  }
}
