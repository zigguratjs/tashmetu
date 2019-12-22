import {Factory} from '@ziggurat/tiamat';
import {RequestHandler} from 'express';
import {AddressInfo} from 'net';

export abstract class RequestHandlerFactory extends Factory<RequestHandler> {
  public abstract create(path: string): RequestHandler;
}

export abstract class ControllerFactory extends Factory<any> {
  public abstract create(): any;
}

/**
 * Server middleware.
 */
export type Middleware =
  RequestHandler | RequestHandlerFactory | (RequestHandler | RequestHandlerFactory)[];

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
