import * as express from 'express';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import {provider, Container, Optional} from '@ziggurat/tiamat';
import {ServerConfig} from './interfaces';
import {Router} from './router';


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
export class Server extends Router {
  public constructor(
    public app: express.Application,
    public server: http.Server,
    public socket: SocketIO.Server,
    container: Container,
    config: ServerConfig | undefined,
  ) {
    super(app);
    if (config) {
      this.applyMiddleware(config.middleware, container);
    }
  }

  public listen(port: number) {
    this.server.listen(port);
  }
}
