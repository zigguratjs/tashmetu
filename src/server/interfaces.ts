import {Injector} from '@samizdatjs/tiamat';
import * as express from 'express';

export type MiddlewareProvider = (injector: Injector) => express.RequestHandler;

export interface MiddlewareConfig {
  path: string;

  handler?: express.RequestHandler;

  provider?: string | MiddlewareProvider;
}

export interface RouterConfig {
  providerFor: string;

  mount?: string;

  routes?: any;

  middleware?: MiddlewareConfig[];
}

export interface RouterMethodConfig {
  path: string;

  middleware?: any; // TODO: Type
}

export interface RouterMetadata {
  target: any;
}

export interface RouterMethodMetadata extends RouterMetadata {
  method: string;

  config: RouterMethodConfig;

  key: string;
}

export interface HandlerDecorator {
  (target: any, key: string, value: any): void;
}

/**
 *
 */
export interface RouterProvider {
  createRouter(injector: Injector): any;
}
