import {classDecorator, propertyDecorator} from '@ziggurat/meta';
import {Injector} from '@ziggurat/tiamat';
import * as express from 'express';
import {MiddlewareConfig, MiddlewareProvider, RouterFactoryProvider} from './interfaces';
import {GetMethodAnnotation, PostMethodAnnotation, PutMethodAnnotation,
  PatchMethodAnnotation, DeleteMethodAnnotation,
  UseAnnotation, UseProviderAnnotation} from './method';
import {MiddlewareAnnotation} from './middleware';

/**
 * Mount a router as middleware.
 *
 * This function allows us to create a piece of middleware from a router factory so that the
 * routes created by it can be mounted on a server or another router.
 *
 * @param provider A provider function for a router factory.
 */
export function router(provider: RouterFactoryProvider): MiddlewareProvider {
  return (injector: Injector) => provider(injector).router();
}

/**
 * Router-level middleware.
 *
 * This decorator can be used to attach middleware to a router or server by decorating
 * the factory.
 *
 * @usageNotes
 *
 * The decorator accepts a list of middleware given as a provider and a path where it should be
 * mounted. The provider is a function with the injector as its only argument that should return
 * an express.RequestHandler.
 *
 * The following example shows how to mount a middleware for serving static files.
 *
 * ```typescript
 * @middleware([
 *   {path: '/static', provider: () => express.static('public')}
 * ])
 * ```
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
