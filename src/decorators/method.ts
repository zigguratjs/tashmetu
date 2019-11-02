import {Annotation, Container, Resolver} from '@ziggurat/tiamat';
import * as express from 'express';
import {Router} from '../router';

export class RouterMethodAnnotation extends Annotation {
  public constructor(
    private method: string,
    private path: string,
    private middleware: (express.RequestHandler | Resolver<express.RequestHandler>)[],
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

    const middleware: express.RequestHandler[] = this.middleware.map(m =>
      m instanceof Resolver ? m.resolve(container) : m
    );
    router.useMethod(this.method, this.path, ...middleware, handler);
  }
}
