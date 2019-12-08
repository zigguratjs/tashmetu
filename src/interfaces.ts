import {RequestHandler} from 'express';
import {Newable, Factory} from '@ziggurat/tiamat';
import {AddressInfo} from 'net';

export abstract class RequestHandlerFactory extends Factory<RequestHandler> {
  public abstract create(): RequestHandler;
}

export abstract class ControllerFactory extends Factory<any> {
  public abstract create(): any;
}

/**
 * Server middleware.
 */
export type Middleware =
  (RequestHandler | RequestHandlerFactory)[] | Newable<any> | ControllerFactory;

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
    ({path, handlers: handlers}));
}
