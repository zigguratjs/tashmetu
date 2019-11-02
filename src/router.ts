import * as express from 'express';
import {Container, Resolver} from '@ziggurat/tiamat';
import {RouterSetupAnnotation} from './decorators/middleware';
import {RouterMethodAnnotation} from './decorators/method';
import {MiddlewareConfig, Middleware} from './interfaces';
import {SocketGateway} from './gateway';

/**
 * Base class for setting up a router.
 *
 * @usageNotes
 * Routes can be added by decorating methods.
 *
 * ```typescript
 * class MyRouter extends Router {
 *   @get('/')
 *   private root(req: express.Request, res: express.Response) {
 *     res.send('Hello World!');
 *   }
 * }
 * ```
 * After adding the class to the components providers, it can be mounted on the server:
 *
 * ```typescript
 * @component({
 *   providers: [MyRouter],
 *   instances: {
 *     'tashmetu.ServerConfig': {
 *        middleware: {
 *          '/': Lookup.of(MyRouter)
 *        }
 *      }
 *   }
 * })
 * class App {
 *   @inject('tashmetu.Server') private server: Server;
 *
 *   public void run() {
 *     this.server.listen(8080);
 *   }
 * }
 * ```
 */
export class Router {
  public constructor(
    public expressRouter: express.Router = express.Router()
  ) {}

  public useMethod(method: string, path: string, ...handlers: express.RequestHandler[]) {
    (this.expressRouter as any)[method](path, handlers);
  }

  public use(path: string, ...handlers: express.RequestHandler[]) {
    this.expressRouter.use(path, handlers);
  }

  public applyMiddleware(config: MiddlewareConfig, container: Container) {
    for (let path of Object.keys(config)) {
      this.expressRouter.use(path, ...([] as Middleware[]).concat(config[path])
        .map(m => this.requestHandler(path, m, container)));
    }
  }

  private requestHandler(
    path: string, middleware: Middleware, container: Container
  ): express.RequestHandler {
    if (middleware instanceof Router) {
      return middleware.applyDecorators(path, container);
    }
    if (middleware instanceof Resolver) {
      return this.requestHandler(path, middleware.resolve(container), container);
    }
    return middleware;
  }

  private applyDecorators(path: string, container: Container) {
    for (let annotation of RouterSetupAnnotation.onClass(this.constructor)) {
      annotation.setup(this, container);
    }
    for (let annotation of RouterMethodAnnotation.onClass(this.constructor, true)) {
      annotation.setup(this, container);
    }
    container.resolve<SocketGateway>('tashmetu.SocketGateway')
      .register(this, {namespace: path});
    return this.expressRouter;
  }
}
