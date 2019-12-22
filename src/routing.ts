import * as express from 'express';
import {ControllerFactory, Middleware, RequestHandlerFactory, Route, RouteMap} from './interfaces';
import {SocketGateway} from './gateway';
import {RouterAnnotation} from './decorators/middleware';

export class RouterFactory extends RequestHandlerFactory {
  public static inject = ['tashmetu.SocketGateway'];

  public constructor(private controller: any | ControllerFactory) {
    super();
  }

  public create(path: string): express.Router {
    const controller = this.controller instanceof ControllerFactory
      ? this.controller.create()
      : this.controller;

    return RouterFactory.resolve((gateway: SocketGateway) => {
      let routes: Route[] = [];

      for (let annotation of RouterAnnotation.onClass(controller.constructor, true)) {
        routes = routes.concat(annotation.routes(controller));
      }
      gateway.register(controller, {namespace: path});

      return mountRoutes(express.Router(), ...routes);
    });
  }
}

export const router = (controller: any | ControllerFactory) => new RouterFactory(controller);

export function makeRoutes(routeMap: RouteMap): Route[] {
  return Object.entries(routeMap).map(([path, handlers]) =>
    ({path, handlers: handlers}));
}

export function mountRoutes(r: express.Router, ...routes: Route[]): express.Router {
  for (let route of routes) {
    const handlers = createHandlers(route.handlers, route.path || '/')
      .map(h => createAsyncHandler(h));

    if (route.method) {
      (<any>r)[route.method](route.path, handlers);
    } else if (route.path) {
      r.use(route.path, handlers);
    } else {
      r.use(handlers);
    }
  }
  return r;
}

function createAsyncHandler(handler: express.RequestHandler): express.RequestHandler  {
  return (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const result: any = handler(req, res, next);
    if (result && result instanceof Promise) {
      result.then((value: any) => {
        if (value && !res.headersSent) {
          res.send(value);
        }
      })
      .catch((error: any) => {
        next(error);
      });
    } else if (result && !res.headersSent) {
      res.send(result);
    }
  };
}

function createHandlers(middleware: Middleware, path: string): express.RequestHandler[] {
  if (Array.isArray(middleware)) {
    return middleware.map(m => m instanceof RequestHandlerFactory ? m.create(path) : m);
  }
  return [middleware instanceof RequestHandlerFactory ? middleware.create(path) : middleware];
}
