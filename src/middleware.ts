import {Container, Resolver} from '@ziggurat/tiamat';
import * as express from 'express';
import {MiddlewareConfig, Middleware} from './interfaces';
import {Router} from './factories/router';
import {RouterSetupAnnotation} from './decorators/middleware';
import {RouterMethodAnnotation} from './decorators/method';

export function configureRouter(
  router: express.Router, config: MiddlewareConfig, container: Container
) {
  for (let path of Object.keys(config)) {
    router.use(path, ...([] as Middleware[]).concat(config[path])
      .map(m => requestHandler(m, container)));
  }
}

export function requestHandler(
  middleware: Middleware, container: Container
): express.RequestHandler {
  if (middleware instanceof Router) {
    return applyDecorators(middleware, container);
  }
  if (middleware instanceof Resolver) {
    return requestHandler(middleware.resolve(container), container);
  }
  return middleware;
}

export function applyDecorators(router: Router, container: Container) {
  for (let annotation of RouterSetupAnnotation.onClass(router.constructor)) {
    annotation.setup(router, container);
  }
  for (let annotation of RouterMethodAnnotation.onClass(router.constructor, true)) {
    annotation.setup(router, container);
  }
  return router.expressRouter;
}
