import {component} from '@ziggurat/tiamat';

export {Server} from './server';
export {MiddlewareProvider, RouterProvider, router, get} from './decorators';

import {Server} from './server';

@component({
  providers: [
    Server
  ]
})
export class Tashmetu {}
