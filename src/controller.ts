import * as express from 'express';
import {Factory, Logger, ServiceRequest} from '@ziqquratu/ziqquratu';
import {RequestHandlerFactory, Route} from './interfaces';
import {SocketGateway} from './gateway';
import {RouterAnnotation} from './decorators/middleware';
import {mountRoutes} from './routing';

export function controllerName(ctr: any): string {
  return typeof ctr.toString === 'function' ? ctr.toString() : ctr.constructor.name;
}

export abstract class ControllerFactory extends Factory<any> {
  public abstract create(): any;
}

/**
 * A factory that creates a controller given a service request.
 */
export class ProviderControllerFactory extends ControllerFactory {
  constructor(provider: ServiceRequest<any>) {
    super(provider);
  }

  public create(): any {
    return this.resolve((controller: any) => controller);
  }
}

/**
 * A factory that creates a request handler from a controller given its factory.
 */
export class RouterFactory extends RequestHandlerFactory {
  public constructor(private controllerFactory: ControllerFactory) {
    super('tashmetu.SocketGateway', 'tashmetu.Logger');
  }

  public create(path: string): express.RequestHandler {
    const controller = this.controllerFactory.create();

    return this.resolve((gateway: SocketGateway, logger: Logger) => {
      logger = logger.inScope('RouterFactory');
      logger.info(`'${path}' as ${controllerName(controller)}`);
      let routes: Route[] = [];

      for (const annotation of RouterAnnotation.onClass(controller.constructor, true)) {
        routes = routes.concat(annotation.routes(controller));
      }
      for (const route of routes) {
        logger.info(`  - ${route.method}\t'${route.path}'`);
      }
      gateway.register(controller, {namespace: path});

      return mountRoutes(express.Router(), ...routes);
    });
  }
}

/**
 * Create a request handler factory from a controller provider or controller factory.
 *
 * This function allows us to turn a controller into a mountable request handler.
 *
 * @param controller A provider of or factory of a controller.
 */
export const router = (controller: ServiceRequest<any> | ControllerFactory) => {
  return new RouterFactory(
    controller instanceof ControllerFactory
      ? controller
      : new ProviderControllerFactory(controller
    )
  );
};
