import {factory, provider} from '@ziggurat/tiamat';
import * as http from 'http';
import * as SocketIO from 'socket.io';

@provider({
  inject: ['http.Server']
})
export class SocketIOServerFactory {
  constructor(
    private server: http.Server
  ) {}

  @factory({key: 'socket.io.Server'})
  public socketIOServer(): SocketIO.Server {
    return SocketIO(this.server);
  }
}
