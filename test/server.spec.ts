import {bootstrap, component, factory, provider} from '@ziggurat/tiamat';
import {ServerFactory} from '../src/factories/server';
import {get} from '../src/decorators';
import {Tashmetu} from '../src/index';
import * as express from 'express';
import * as request from 'supertest';
import 'mocha';

describe('ServerFactory', () => {
  @provider()
  class TestServerFactory extends ServerFactory {
    @factory({key: 'express.Application'})
    public app(): express.Application {
      return super.app();
    }

    @get({path: '/get_async'})
    async foo(req: express.Request, res: express.Response): Promise<any> {
      return {};
    }
  }

  @component({
    providers: [TestServerFactory],
    dependencies: [Tashmetu]
  })
  class TestComponent {}

  let app = bootstrap(TestComponent).get<express.Application>('express.Application');

  describe('get decorator', () => {
    it('should work with an async handler', (done) => {
      request(app).get('/get_async').expect(200, done); 
    });
  });
});
