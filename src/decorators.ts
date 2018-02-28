import {classDecorator, propertyDecorator, Injector, PropertyMeta,
  PropertyDecorator, TaggedClassAnnotation} from '@ziggurat/tiamat';
import {RouterFactory} from './factories/router';
import * as express from 'express';

export type MiddlewareProvider = (injector: Injector) => express.RequestHandler;
export type RouterFactoryProvider = (injector: Injector) => RouterFactory;
export type RouterProvider = (injector: Injector) => any;

export interface MiddlewareConfig {
  path: string;

  handler?: express.RequestHandler;

  provider?: MiddlewareProvider;

  factory?: string | RouterFactoryProvider;
}

export interface RouterConfig {
  routes?: any[]; // TODO: Type

  middleware?: MiddlewareConfig[];
}

export const router = classDecorator<RouterConfig>(
  new TaggedClassAnnotation('tashmetu:router', ['tashmetu.Router']), {
    routes: [],
    middleware: [],
  });

export interface RouterMethodConfig {
  path: string;

  middleware?: any; // TODO: Type
}

export interface RouterMethodMeta extends PropertyMeta<RouterMethodConfig> {
  method: string;
}

export class RouterMethodDecorator extends PropertyDecorator<RouterMethodConfig> {
  public constructor(private method: string) {
    super();
  }

  public decorate(data: RouterMethodConfig, target: any, key: string) {
    let meta: RouterMethodMeta = {target, key, method: this.method, data};
    this.appendMeta('tashmetu:router-method', meta, target.constructor);
  }
}

export const get = propertyDecorator<RouterMethodConfig>(
  new RouterMethodDecorator('get'));

export const post = propertyDecorator<RouterMethodConfig>(
  new RouterMethodDecorator('post'));

export const put = propertyDecorator<RouterMethodConfig>(
  new RouterMethodDecorator('put'));

export const patch = propertyDecorator<RouterMethodConfig>(
  new RouterMethodDecorator('patch'));

export const del = propertyDecorator<RouterMethodConfig>(
  new RouterMethodDecorator('delete'));
