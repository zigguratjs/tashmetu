import {component, factory} from '@ziggurat/tiamat';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import * as express from 'express';

export * from './decorators';
export * from './resource';
export {RouterFactory} from './factories/router';
export {ServerFactory} from './factories/server';

@component()
export default class Tashmetu {
  @factory({
    key: 'socket.io.Server',
    inject: ['http.Server']
  })
  public socketIOServer(server: http.Server): SocketIO.Server {
    return SocketIO(server);
  }

  @factory({
    key: 'http.Server',
    inject: ['express.Application']
  })
  public httpServer(app: express.Application): http.Server {
    return http.createServer(app);
  }
}
