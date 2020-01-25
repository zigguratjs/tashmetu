import * as express from 'express';
import {Middleware, RequestHandlerFactory, Route, RouteMap} from './interfaces';

export function makeRoutes(routeMap: RouteMap): Route[] {
  return Object.entries(routeMap).map(([path, handlers]) =>
    ({path, handlers: handlers}));
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

export function mountRoutes(r: express.Router, ...routes: Route[]): express.Router {
  for (const route of routes) {
    const handlers = createHandlers(route.handlers, route.path || '/')
      .map(h => createAsyncHandler(h));

    if (route.method) {
      (r as any)[route.method](route.path, handlers);
    } else if (route.path) {
      r.use(route.path, handlers);
    } else {
      r.use(handlers);
    }
  }
  return r;
}
