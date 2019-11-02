import {component, factory} from '@ziggurat/tiamat';
import * as http from 'http';
import * as SocketIO from 'socket.io';
import * as express from 'express';
import {SocketGateway} from './gateway';
import {Server} from './server';

export * from './decorators';
export * from './routers/resource';
export {Router} from './router';
export {Server};

@component({
  providers: [SocketGateway, Server]
})
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

  @factory({
    key: 'express.Application'
  })
  public expressApp(): express.Application {
    return express();
  }
}
