import * as express from 'express';

/**
 * Base class for setting up a router.
 *
 * @usageNotes
 * Routes can be added by decorating methods.
 *
 * ```typescript
 * @provider({key: 'MyRouter'})
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
 *          '/': 'MyRouter'
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
  public expressRouter: express.Router;

  public constructor() {
    this.expressRouter = express.Router();
  }

  public useMethod(method: string, path: string, ...handlers: express.RequestHandler[]) {
    (this.expressRouter as any)[method](path, handlers);
  }

  public use(path: string, ...handlers: express.RequestHandler[]) {
    this.expressRouter.use(path, handlers);
  }
}
