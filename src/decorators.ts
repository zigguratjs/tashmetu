import {classDecorator, propertyDecorator, Injector,
  PropertyDecorator, TaggedClassAnnotation} from '@ziggurat/tiamat';
import {RouterFactory, Factory} from './factories/router';
import * as express from 'express';
import {each, reverse, map} from 'lodash';

export type MiddlewareProvider = (injector: Injector) => express.RequestHandler;
export type RouterFactoryProvider = (injector: Injector) => RouterFactory;

export interface MiddlewareConfig {
  path: string;

  handler?: express.RequestHandler;

  provider?: MiddlewareProvider;

  router?: string | RouterFactoryProvider;
}

export interface RouterConfig {
  middleware?: MiddlewareConfig[];
}

export const router = classDecorator<RouterConfig>(
  new TaggedClassAnnotation('tashmetu:router', ['tashmetu.Router']), {
    middleware: []
  });

export function getMetadata<T>(key: string, target: any, Cls: any) {
  if (!Reflect.hasOwnMetadata(key, target)) {
    Reflect.defineMetadata(key, new Cls(), target);
  }
  return Reflect.getOwnMetadata(key, target);
}

export class RouterMeta {
  private setupHandlers: Function[] = [];
  private methodMiddleware: {[key: string]: MiddlewareProvider[]} = {};

  public static get(target: any): RouterMeta {
    return getMetadata<RouterMeta>('tashmetu:router-meta', target, RouterMeta);
  }

  public onSetup(fn: (rt: express.Router, injector: Injector) => void) {
    this.setupHandlers.push(fn);
  }

  public addMiddleware(provider: MiddlewareProvider, key?: string) {
    if (key) {
      (this.methodMiddleware[key] = this.methodMiddleware[key] || []).push(provider);
    }
    return this;
  }

  public getMiddleware(key: string): MiddlewareProvider[] {
    return reverse(this.methodMiddleware[key]);
  }

  public setup(rt: express.Router, injector: Injector) {
    each(this.setupHandlers, (fn: Function) => fn(rt, injector));
  }
}

export class RouterMethodDecorator extends PropertyDecorator<string> {
  public constructor(private method: string) {
    super();
  }

  public decorate(data: string, target: any, key: string) {
    let meta = RouterMeta.get(target.constructor);

    meta.addMiddleware((injector: Injector) => {
      return (req: express.Request, res: express.Response, next: express.NextFunction) => {
        const result: any = target[key](req, res, next);
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
    }, key);
    meta.onSetup((rt: express.Router, injector: Injector) => {
      (<any>rt)[this.method](data, map(meta.getMiddleware(key), provider => provider(injector)));
    });
  }
}

export const get = propertyDecorator<string>(
  new RouterMethodDecorator('get'));

export const post = propertyDecorator<string>(
  new RouterMethodDecorator('post'));

export const put = propertyDecorator<string>(
  new RouterMethodDecorator('put'));

export const patch = propertyDecorator<string>(
  new RouterMethodDecorator('patch'));

export const del = propertyDecorator<string>(
  new RouterMethodDecorator('delete'));

export const use = (handler: express.RequestHandler) => {
  return (target: any, key: string) => {
    RouterMeta.get(target.constructor).addMiddleware(injector => handler, key);
  };
};

export const useProvider = (provider: MiddlewareProvider) => {
  return (target: any, key: string) => {
    RouterMeta.get(target.constructor).addMiddleware(provider, key);
  };
};
