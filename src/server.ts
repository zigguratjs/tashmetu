import * as express from 'express';
import * as http from 'http';
import {AddressInfo} from 'net';
import {provider, Optional} from '@ziqquratu/ziqquratu';
import {Route, Server, ServerConfig} from './interfaces';
import {makeRoutes, mountRoutes} from './routing';

@provider({
  key: 'tashmetu.Server',
  inject: [
    'express.Application',
    'http.Server',
    Optional.of('tashmetu.ServerConfig'),
  ]
})
export class TashmetuServer implements Server {
  public constructor(
    private app: express.Application,
    private server: http.Server,
    config?: ServerConfig,
  ) {
    if (config) {
      mountRoutes(this.app, ...makeRoutes(config.middleware));
    }
  }

  public mount(route: Route) {
    mountRoutes(this.app, route);
  }

  public listen(port: number): http.Server {
    return this.server.listen(port);
  }

  public address(): string | AddressInfo | null {
    return this.server.address();
  }
}
