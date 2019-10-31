import {provider} from '@ziggurat/tiamat';
import * as SocketIO from 'socket.io';

export interface GatewayConfig {
  namespace?: string;
}

@provider({
  key: 'tashmetu.SocketGateway',
  inject: ['socket.io.Server']
})
export class SocketGateway {
  public constructor(private socket: SocketIO.Server) {}

  public register(instance: any, config?: GatewayConfig) {
    if (typeof instance.onConnection === 'function') {
      const nsp = config && config.namespace
        ? this.socket.of(config.namespace)
        : this.socket;

      nsp.on('connection', socket => instance.onConnection(socket));
    }
  }
}
