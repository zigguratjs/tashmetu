import {Container} from '@ziggurat/tiamat';
import * as express from 'express';
import {MiddlewareConfig, Middleware} from './interfaces';
import {Router} from './factories/router';
import {RouterSetupAnnotation} from './decorators/middleware';
import {RouterMethodAnnotation} from './decorators/method';

export function configureRouter(router: express.Router, config: MiddlewareConfig, container: Container) {
  for (let path of Object.keys(config)) {
    router.use(path, ...([] as Middleware[]).concat(config[path])
      .map(m => requestHandler(m, container)));
  }
}

export function requestHandler(middleware: Middleware, container: Container): express.RequestHandler {
  if (typeof middleware === 'string') {
    return requestHandler(container.resolve<Middleware>(middleware), container);
  }
  if (middleware instanceof Router) {
    return applyDecorators(middleware, container);
  }
  const product = middleware(container);
  if (product instanceof Router) {
    return applyDecorators(product, container);
  } else {
    return product;
  }
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
