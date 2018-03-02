import {classDecorator, propertyDecorator, Injector} from '@ziggurat/tiamat';
import {RouterConfig, MiddlewareProvider} from './interfaces';
import {RouterMethodDecorator} from './method';
import {RouterDecorator} from './router';
import {RouterMeta} from './meta';
import * as express from 'express';

export const router = classDecorator<RouterConfig>(
  new RouterDecorator(), {
    middleware: []
  });

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
    RouterMeta.get(target.constructor).addMethodMiddleware(key, injector => handler);
  };
};

export const useProvider = (provider: MiddlewareProvider) => {
  return (target: any, key: string) => {
    RouterMeta.get(target.constructor).addMethodMiddleware(key, provider);
  };
};
