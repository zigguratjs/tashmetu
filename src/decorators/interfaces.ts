import {Producer} from '@ziggurat/tiamat';
import * as express from 'express';

/**
 * Configuration options for router middleware.
 */
export interface MiddlewareConfig {
  /**
   * Path where the middleware should be mounted.
   */
  path: string;

  /**
   * The producer of the middleware.
   */
  producer: Producer<express.RequestHandler>;
}
