import * as express from 'express';
import {Factory, Newable} from '@ziggurat/tiamat';
import {RequestHandlerFactory, Route} from './interfaces';
import {SocketGateway} from './gateway';
import {RouterAnnotation} from './decorators/middleware';
import {mountRoutes} from './routing';

export abstract class ControllerFactory extends Factory<any> {
  public abstract create(): any;
}

export class ProviderControllerFactory extends ControllerFactory {
  constructor(ctr: Newable<any>) {
    super(ctr);
  }

  public create(): any {
    return this.resolve((controller: any) => controller);
  }
}

export class RouterFactory extends RequestHandlerFactory {
  public constructor(private fact: ControllerFactory) {
    super('tashmetu.SocketGateway');
  }

  public create(path: string): express.RequestHandler {
    const controller = this.fact.create();

    return this.resolve((gateway: SocketGateway) => {
      let routes: Route[] = [];

      for (let annotation of RouterAnnotation.onClass(controller.constructor, true)) {
        routes = routes.concat(annotation.routes(controller));
      }
      gateway.register(controller, {namespace: path});

      return mountRoutes(express.Router(), ...routes);
    });
  }
}

export const router = (controller: Newable<any> | ControllerFactory) => {
  return new RouterFactory(
    controller instanceof ControllerFactory
      ? controller
      : new ProviderControllerFactory(controller
    )
  );
};
