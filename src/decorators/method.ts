import {Annotation, Container, Producer} from '@ziggurat/tiamat';
import * as express from 'express';
import {RouterFactory} from '../factories/router';

export class MethodMiddlewareAnnotation extends Annotation {
  public produce(container: Container): express.RequestHandler {
    throw Error('Method not implemented');
  }
}

export class UseAnnotation extends MethodMiddlewareAnnotation {
  public constructor(
    private producer: Producer<express.RequestHandler>
  ) { super(); }

  public produce(container: Container): express.RequestHandler {
    return this.producer(container);
  }
}

export class RouterMethodAnnotation extends Annotation {
  public constructor(
    private method: string,
    private path: string,
    private target: any,
    private propertyKey: string
  ) { super(); }

  public setup(factory: RouterFactory, router: express.Router, container: Container) {
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

    const mwAnnotations = MethodMiddlewareAnnotation.onClass(this.target.constructor);
    const middleware = mwAnnotations.map(a => a.produce(container));
    (<any>router)[this.method](this.path, middleware, handler);
  }
}
