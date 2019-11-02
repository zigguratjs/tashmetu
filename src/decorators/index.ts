import {classDecorator, propertyDecorator} from '@ziggurat/tiamat';
import {MiddlewareConfig, Middleware} from '../interfaces';
import {RouterMethodAnnotation, UseAnnotation} from './method';
import {MiddlewareAnnotation} from './middleware';

/**
 * Router-level middleware.
 *
 * This decorator can be used to attach middleware to a router by decorating its class.
 *
 * @usageNotes
 *
 * The decorator accepts a map of middleware.
 *
 * The following example shows how to mount a middleware for serving static files.
 *
 * ```typescript
 * @middleware({
 *   '/static': express.static('public')
 * })
 * ```
 */
export const middleware = <(config: MiddlewareConfig) => any>
  classDecorator(MiddlewareAnnotation, {});

const method = <(name: string, path: string) => any>
  propertyDecorator(RouterMethodAnnotation);

/** HTTP GET request handler. */
export const get = (path: string) => method('get', path);

/** HTTP POST request handler. */
export const post = (path: string) => method('post', path);

/** HTTP PUT request handler. */
export const put = (path: string) => method('put', path);

/** HTTP PATCH request handler. */
export const patch = (path: string) => method('patch', path);

/** HTTP DELETE request handler. */
export const del = (path: string) => method('delete', path);

/**
 * Method-level middleware
 *
 * Adds a middleware request handler for the decorated method.
 */
export const use = <(middleware: Middleware) => any>
  propertyDecorator(UseAnnotation);
