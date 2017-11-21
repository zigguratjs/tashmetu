import {component} from '@ziggurat/tiamat';

import {HttpServerFactory} from './factories/http';
import {SocketIOServerFactory} from './factories/socket';
import {MiddlewareFactory} from './factories/middleware';

export {MiddlewareProvider, RouterProvider, router, get} from './decorators';
export {MiddlewareFactory} from './factories/middleware';
export {RouterFactory} from './factories/router';
export {ServerFactory} from './factories/server';

@component({
  providers: [
    HttpServerFactory,
    MiddlewareFactory,
    SocketIOServerFactory
  ],
})
export class Tashmetu {}
