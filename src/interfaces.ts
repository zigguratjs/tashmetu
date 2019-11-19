import {RequestHandler} from 'express';
import {Resolver} from '@ziggurat/tiamat';
import {AddressInfo} from 'net';

/**
 * Server middleware.
 *
 * If it is a string the middleware will be obtained from the container.
 */
export type Middleware =
  (RequestHandler | Resolver<RequestHandler>)[] | any | Resolver<any>;

export type RouteMap = {[path: string]: Middleware};

export type RouteMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';

export interface Route {
  path?: string;
  method?: RouteMethod;
  handlers: Middleware;
}

export interface ServerConfig {
  middleware: RouteMap;
}

export interface Server {
  listen(port: number): any;

  address(): string | AddressInfo | null;
}

export function makeRoutes(routeMap: RouteMap): Route[] {
  return Object.entries(routeMap).map(([path, handlers]) =>
    ({path, handlers: [].concat(handlers)}));
}
