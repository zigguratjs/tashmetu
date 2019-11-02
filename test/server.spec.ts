import {bootstrap, component, Lookup} from '@ziggurat/tiamat';
import {Router} from '../src/router';
import {Server} from '../src/server';
import {get} from '../src/decorators';
import Tashmetu from '../src/index';
import * as express from 'express';
import * as request from 'supertest-as-promised';
import 'mocha';

describe('ServerFactory', async () => {
  class TestServerFactory extends Router {
    @get('/asyncGet')
    private async asyncGet(req: express.Request, res: express.Response): Promise<any> {
      return {};
    }

    @get('/promiseGet')
    private promiseGet(req: express.Request, res: express.Response): Promise<any> {
      return Promise.resolve({});
    }
  }

  @component({
    providers: [TestServerFactory],
    dependencies: [Tashmetu],
    instances: {
      'tashmetu.ServerConfig': {
        middleware: {'/': Lookup.of(TestServerFactory)}
      }
    },
    inject: ['tashmetu.Server']
  })
  class TestComponent {
    constructor(
      public server: Server
    ) {}
  }

  let app: express.Application;

  before(async () => {
    app = (await bootstrap(TestComponent)).server.app;
  });

  describe('get decorator', async () => {
    it('should work with an async handler', async () => {
      return request(app).get('/asyncGet').expect(200);
    });

    it('should work with promises', () => {
      return request(app).get('/promiseGet').expect(200);
    });
  });
});
