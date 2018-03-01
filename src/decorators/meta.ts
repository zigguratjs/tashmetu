import {Injector} from '@ziggurat/tiamat';
import {MiddlewareProvider} from './interfaces';
import * as express from 'express';
import {each, reverse} from 'lodash';

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
