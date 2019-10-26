import {Annotation, Container} from '@ziggurat/tiamat';
import {RequestHandler, Router} from 'express';
import {MiddlewareConfig, Middleware} from './interfaces';
import {RouterFactory} from '../factories/router';

export class RouterSetupAnnotation extends Annotation {
  public setup(factory: RouterFactory, router: Router, container: Container) {
    return;
  }
}

export class MiddlewareAnnotation extends RouterSetupAnnotation {
  public constructor(
    private config: MiddlewareConfig
  ) { super(); }

  public setup(factory: RouterFactory, router: Router, container: Container) {
    for (let path of Object.keys(this.config)) {
      router.use(path, ...([] as Middleware[]).concat(this.config[path])
        .map(m => this.produce(m, container)));
    }
  }

  private produce(middleware: Middleware, container: Container): RequestHandler {
    if (typeof middleware === 'string') {
      return this.produce(container.resolve<Middleware>(middleware), container);
    }
    if (middleware instanceof RouterFactory) {
      return middleware.router(container);
    }
    const product = middleware(container);
    if (product instanceof RouterFactory) {
      return product.router(container);
    } else {
      return product;
    }
  }
}
