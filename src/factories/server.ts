import * as express from 'express';
import {factory, Container} from '@ziggurat/tiamat';
import {RouterFactory} from './router';

/**
 * Base class for setting up a server.
 *
 * Extend this class in order to create and configure an express application.
 *
 * @usageNotes
 * Routes can be added by decorating methods.
 *
 * ```typescript
 * class Server extends ServerFactory {
 *   @get('/')
 *   private root(req: express.Request, res: express.Response) {
 *     res.send('Hello World!');
 *   }
 * }
 * ```
 * After adding the class to the components providers, 'express.Application' can be injected.
 *
 * ```typescript
 * @component({
 *   providers: [Server]
 * })
 * class App {
 *   @inject('express.Application') private server: express.Application;
 *
 *   public void run() {
 *     this.server.listen(8080);
 *   }
 * }
 * ```
 */
export class ServerFactory extends RouterFactory {
  /**
   * Creates an instance of express.Application.
   *
   * This factory function will create the express app and apply all decorators on the class
   * to it.
   *
   * @usageNotes
   * To dynamically add routes to the server, overload this function in the subclass.
   *
   * ```typescript
   * class Server extends ServerFactory {
   *   public app(container: Container): express.Application {
   *     return super.app(container).get('/', (req, res) => {
   *       res.send('Hello world');
   *     });
   *   }
   * }
   * ```
   */
  @factory({key: 'express.Application'})
  public app(container: Container): express.Application {
    const app = express();
    this.applyDecorators(app, container);
    return app;
  }
}
