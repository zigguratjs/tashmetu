import {classDecorator, propertyDecorator} from '@ziggurat/meta';
import {Injector} from '@ziggurat/tiamat';
import * as express from 'express';
import {MiddlewareConfig, MiddlewareProvider} from './interfaces';
import {GetMethodAnnotation, PostMethodAnnotation, PutMethodAnnotation,
  PatchMethodAnnotation, DeleteMethodAnnotation,
  UseAnnotation, UseProviderAnnotation} from './method';
import {MiddlewareAnnotation} from './middleware';

/**
 * Router-level middleware.
 *
 * This decorator can be used to attach middleware to a router or server by decorating
 * the factory.
 */
export const middleware = <(config: MiddlewareConfig[]) => any>
  classDecorator(MiddlewareAnnotation, []);

/**
 * HTTP GET request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const get = <(path: string) => any>
  propertyDecorator(GetMethodAnnotation);

/**
 * HTTP POST request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const post = <(path: string) => any>
  propertyDecorator(PostMethodAnnotation);

/**
 * HTTP PUT request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const put = <(path: string) => any>
  propertyDecorator(PutMethodAnnotation);

/**
 * HTTP PATCH request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const patch = <(path: string) => any>
  propertyDecorator(PatchMethodAnnotation);

/**
 * HTTP DELETE request handler.
 *
 * Decorate a router-method to turn it into a request handler.
 * Takes path as argument.
 */
export const del = <(path: string) => any>
  propertyDecorator(DeleteMethodAnnotation);

/**
 * Method-level middleware
 *
 * Adds a middleware request handler to a router method.
 */
export const use = <(handler: express.RequestHandler) => any>
  propertyDecorator(UseAnnotation);

/**
 * Method-level middleware
 *
 * Adds a middleware request handler through a provider to a router method.
 */
export const useProvider = <(provider: MiddlewareProvider) => any>
  propertyDecorator(UseProviderAnnotation);
