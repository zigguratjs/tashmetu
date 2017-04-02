import {classDecorator, propertyDecorator, Injector, PropertyMeta, PropertyMetaWriter} from '@samizdatjs/tiamat';
import {ProviderFor, ProviderMetaWriter} from '@samizdatjs/tashmetu';
import * as express from 'express';

export type MiddlewareProvider = (injector: Injector) => express.RequestHandler;
export type RouterProvider = (injector: Injector) => any;

export interface MiddlewareConfig {
  path: string;

  handler?: express.RequestHandler;

  provider?: string | MiddlewareProvider;
}

export interface RouterConfig extends ProviderFor {
  mount?: string;

  routes?: any[]; // TODO: Type

  middleware?: MiddlewareConfig[];
}

export const router = classDecorator<RouterConfig>(
  new ProviderMetaWriter('tashmetu:router', ['tashmetu.Router']), {
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

export class RouterMethodMetaWriter extends PropertyMetaWriter<RouterMethodConfig> {
  public constructor(private method: string) {
    super();
  }

  public write(data: RouterMethodConfig, target: any, key: string) {
    let meta: RouterMethodMeta = {target, key, method: this.method, data};
    this.append('tashmetu:router-method', meta, target.constructor);
  }
}

export const get = propertyDecorator<RouterMethodConfig>(
  new RouterMethodMetaWriter('get'));
