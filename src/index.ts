import {component} from '@ziggurat/tiamat';

import {HttpServerFactory} from './factories/http';
import {SocketIOServerFactory} from './factories/socket';

export {MiddlewareProvider, RouterFactoryProvider, RouterProvider,
  router, get} from './decorators';
export {RouterFactory} from './factories/router';
export {ServerFactory} from './factories/server';

@component({
  providers: [
    HttpServerFactory,
    SocketIOServerFactory
  ],
})
export class Tashmetu {}
