import {classDecorator, propertyDecorator, Injector} from '@ziggurat/tiamat';
import {MiddlewareConfig, MiddlewareProvider} from './interfaces';
import {RouterMethodDecorator} from './method';
import {MiddlewareDecorator} from './middleware';
import {RouterMeta} from './meta';
import * as express from 'express';

/**
 * Router-level middleware.
 *
 * This decorator can be used to attach middleware to a router or server by decorating
 * the factory.
 */
export const middleware = classDecorator<MiddlewareConfig[]>(
  new MiddlewareDecorator());

/**
 * HTTP GET request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const get = propertyDecorator<string>(
  new RouterMethodDecorator('get'));

/**
 * HTTP POST request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const post = propertyDecorator<string>(
  new RouterMethodDecorator('post'));

/**
 * HTTP PUT request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const put = propertyDecorator<string>(
  new RouterMethodDecorator('put'));

/**
 * HTTP PATCH request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const patch = propertyDecorator<string>(
  new RouterMethodDecorator('patch'));

/**
 * HTTP DELETE request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const del = propertyDecorator<string>(
  new RouterMethodDecorator('delete'));

/**
 * Method-level middleware
 *
 * Adds a middleware request handler to a router method.
 */
export const use = (handler: express.RequestHandler) => {
  return (target: any, key: string) => {
    RouterMeta.get(target.constructor).addMethodMiddleware(key, injector => handler);
  };
};

/**
 * Method-level middleware
 *
 * Adds a middleware request handler through a provider to a router method.
 */
export const useProvider = (provider: MiddlewareProvider) => {
  return (target: any, key: string) => {
    RouterMeta.get(target.constructor).addMethodMiddleware(key, provider);
  };
};
