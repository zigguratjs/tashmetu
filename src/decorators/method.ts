import {getType} from 'reflect-helper';
import {Injector} from '@ziggurat/tiamat';
import * as express from 'express';
import {map} from 'lodash';
import {RouterFactory} from '../factories/router';
import {MiddlewareProvider} from './interfaces';

export class MethodMiddlewareAnnotation {
  public provide(injector: Injector): express.RequestHandler {
    throw Error('Method not implemented');
  }
}

export class UseAnnotation extends MethodMiddlewareAnnotation {
  public constructor(
    private requestHandler: express.RequestHandler
  ) { super(); }

  public provide(injector: Injector): express.RequestHandler {
    return this.requestHandler;
  }
}

export class UseProviderAnnotation extends MethodMiddlewareAnnotation {
  public constructor(
    private provider: MiddlewareProvider
  ) { super(); }

  public provide(injector: Injector): express.RequestHandler {
    return this.provider(injector);
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
    const middleware = map(mwAnnotations, annotation => annotation.provide(injector));
    (<any>router)[this.method](this.path, middleware, handler);
  }
}

export class GetMethodAnnotation extends RouterMethodAnnotation {
  public constructor(path: string, target: any, propertyKey: string) {
    super('get', path, target, propertyKey);
  }
}

export class PostMethodAnnotation extends RouterMethodAnnotation {
  public constructor(path: string, target: any, propertyKey: string) {
    super('post', path, target, propertyKey);
  }
}

export class PutMethodAnnotation extends RouterMethodAnnotation {
  public constructor(path: string, target: any, propertyKey: string) {
    super('put', path, target, propertyKey);
  }
}

export class PatchMethodAnnotation extends RouterMethodAnnotation {
  public constructor(path: string, target: any, propertyKey: string) {
    super('patch', path, target, propertyKey);
  }
}

export class DeleteMethodAnnotation extends RouterMethodAnnotation {
  public constructor(path: string, target: any, propertyKey: string) {
    super('delete', path, target, propertyKey);
  }
}
