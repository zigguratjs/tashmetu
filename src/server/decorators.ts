import {classDecorator, propertyDecorator, Injector, PropertyMeta,
  PropertyDecorator, TaggedClassAnnotation} from '@samizdatjs/tiamat';
import * as express from 'express';

export type MiddlewareProvider = (injector: Injector) => express.RequestHandler;
export type RouterProvider = (injector: Injector) => any;

export interface MiddlewareConfig {
  path: string;

  handler?: express.RequestHandler;

  provider?: string | MiddlewareProvider;
}

export interface RouterConfig {
  mount?: string;

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
