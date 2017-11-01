import {component} from '@ziggurat/tiamat';
import * as express from 'express';
import * as http from 'http';
import * as socket from 'socket.io';

export {MiddlewareProvider, RouterProvider, router, get} from './decorators';

import {Server} from './server';

const expressApp = express();
const httpServer = http.createServer(expressApp);
const socketIOServer = socket(httpServer);

@component({
  providers: [
    Server
  ],
  definitions: {
    'express.Application': expressApp,
    'http.Server': httpServer,
    'socket.io.Server': socketIOServer
  },
  autoCreate: [
    'tashmetu.Server'
  ]
})
export class Tashmetu {}
