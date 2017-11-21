import * as express from 'express';
import {inject, provider, Injector} from '@ziggurat/tiamat';
import {MiddlewareConfig, MiddlewareProvider} from '../decorators';

@provider({
  key: 'tashmetu.MiddlewareFactory'
})
export class MiddlewareFactory {
  @inject('tiamat.Injector') private injector: Injector;

  public createRequestHandler(p: string | MiddlewareProvider): express.RequestHandler {
    if (typeof p === 'string') {
      return this.injector.get<any>(p).router();
    } else {
      return p(this.injector);
    }
  }

  public createMethodRequestHandler(controller: any, key: string): express.RequestHandler {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const result: any = controller[key](req, res, next);
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
}
