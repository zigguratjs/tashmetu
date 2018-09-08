import {getType} from 'reflect-helper';
import {Injector, Producer} from '@ziggurat/tiamat';
import * as express from 'express';
import {map} from 'lodash';
import {RouterFactory} from '../factories/router';

export class MethodMiddlewareAnnotation {
  public produce(injector: Injector): express.RequestHandler {
    throw Error('Method not implemented');
  }
}

export class UseAnnotation extends MethodMiddlewareAnnotation {
  public constructor(
    private producer: Producer<express.RequestHandler>
  ) { super(); }

  public produce(injector: Injector): express.RequestHandler {
    return this.producer(injector);
  }
}

export class RouterMethodAnnotation {
  public constructor(
    private method: string,
    private path: string,
    private target: any,
    private propertyKey: string
  ) {}

  public setup(factory: RouterFactory, router: express.Router, injector: Injector) {
    let handler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const result: any = (<any>factory)[this.propertyKey](req, res, next);
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

    const type = getType(this.target.constructor);
    const mwAnnotations = type.getAnnotations(MethodMiddlewareAnnotation);
    const middleware = map(mwAnnotations, annotation => annotation.produce(injector));
    (<any>router)[this.method](this.path, middleware, handler);
  }
}
