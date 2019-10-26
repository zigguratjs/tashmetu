import {Producer} from '@ziggurat/tiamat';
import {RouterFactory} from '../factories/router';
import {RequestHandler} from 'express';

/**
 * Server middleware.
 *
 * If it is a string the middleware will be obtained from the container.
 */
export type Middleware =
  Producer<RequestHandler> | Producer<RouterFactory> | RouterFactory | string;

export type MiddlewareConfig = {
  [path: string]: Middleware | Middleware[];
};
