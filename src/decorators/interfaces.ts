import {Injector} from '@ziggurat/tiamat';
import * as express from 'express';
import {RouterFactory} from '../factories/router';

export type MiddlewareProvider = (injector: Injector) => express.RequestHandler;
export type RouterFactoryProvider = (injector: Injector) => RouterFactory;

export interface MiddlewareConfig {
  path: string;

  handler?: express.RequestHandler;

  provider?: MiddlewareProvider;

  router?: string | RouterFactoryProvider;
}

export interface RouterConfig {
  middleware?: MiddlewareConfig[];
}
