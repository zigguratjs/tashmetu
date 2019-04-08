import {factory} from '@ziggurat/tiamat';
import * as http from 'http';
import * as SocketIO from 'socket.io';

export class SocketIOServerFactory {
  @factory({
    key: 'socket.io.Server',
    inject: ['http.Server']
  })
  public socketIOServer(server: http.Server): SocketIO.Server {
    return SocketIO(server);
  }
}
