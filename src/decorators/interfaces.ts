import {Injector} from '@ziggurat/tiamat';
import * as express from 'express';
import {RouterFactory} from '../factories/router';

export type MiddlewareProvider = (injector: Injector) => express.RequestHandler;
export type RouterFactoryProvider = (injector: Injector) => RouterFactory;

/**
 * Configuration options for router middleware.
 */
export interface MiddlewareConfig {
  /**
   * Path where the middleware should be mounted.
   */
  path: string;

  /**
   * The provider of the middleware.
   */
  provider: MiddlewareProvider;
}
