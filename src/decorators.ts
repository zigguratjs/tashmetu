import {classDecorator, propertyDecorator, Injector, PropertyMeta,
  PropertyDecorator, TaggedClassAnnotation} from '@ziggurat/tiamat';
import {RouterFactory} from './factories/router';
import * as express from 'express';

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

export interface RouterMethodMeta extends PropertyMeta<string> {
  method: string;
}

export interface RouterMethodMiddlewareMeta<T> extends PropertyMeta<T> {
  isProvider: boolean;
}

export class RouterMethodDecorator extends PropertyDecorator<string> {
  public constructor(private method: string) {
    super();
  }

  public decorate(data: string, target: any, key: string) {
    let meta: RouterMethodMeta = {target, key, method: this.method, data};
    this.appendMeta('tashmetu:router-method', meta, target.constructor);
  }
}

export class RouterMethodMiddlewareDecorator<T> extends PropertyDecorator<T> {
  public constructor(private isProvider: boolean) {
    super();
  }

  public decorate(data: T, target: any, key: string) {
    let meta: RouterMethodMiddlewareMeta<T> = {target, key, data, isProvider: this.isProvider};
    this.appendMeta('tashmetu:router-method-middleware', meta, target.constructor);
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

export const use = propertyDecorator<express.RequestHandler>(
  new RouterMethodMiddlewareDecorator<express.RequestHandler>(false));

export const useProvider = propertyDecorator<MiddlewareProvider>(
  new RouterMethodMiddlewareDecorator<MiddlewareProvider>(true));
