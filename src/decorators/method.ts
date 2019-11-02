import {Annotation, Container} from '@ziggurat/tiamat';
import * as express from 'express';
import {Router} from '../factories/router';
import {Middleware} from '../interfaces';
import {requestHandler} from '../middleware';

export class MethodMiddlewareAnnotation extends Annotation {
  public produce(container: Container): express.RequestHandler {
    throw Error('Method not implemented');
  }
}

export class UseAnnotation extends MethodMiddlewareAnnotation {
  public constructor(
    private middleware: Middleware
  ) { super(); }

  public produce(container: Container): express.RequestHandler {
    return requestHandler(this.middleware, container);
  }
}

export class RouterMethodAnnotation extends Annotation {
  public constructor(
    private method: string,
    private path: string,
    private target: any,
    private propertyKey: string
  ) { super(); }

  public setup(router: Router, container: Container) {
    let handler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const result: any = (<any>router)[this.propertyKey](req, res, next);
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

    const middleware = MethodMiddlewareAnnotation
      .onClass(this.target.constructor)
      .map(a => a.produce(container));
    router.useMethod(this.method, this.path, ...middleware, handler);
  }
}
