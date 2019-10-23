import {Producer} from '@ziggurat/tiamat';
import * as express from 'express';

export type MiddlewareConfig = {
  [path: string]: Producer<express.RequestHandler> | Producer<express.RequestHandler>[]
};
