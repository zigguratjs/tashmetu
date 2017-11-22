import {bootstrap, component, factory, provider} from '@ziggurat/tiamat';
import {ServerFactory} from '../src/factories/server';
import {RouterFactory} from '../src/factories/router';
import {get, router} from '../src/decorators';
import {Tashmetu} from '../src/index';
import * as express from 'express';
import * as request from 'supertest';
import 'mocha';

describe('RouterFactory', () => {
  @provider({
    key: 'test.Router'
  })
  class TestRouterFactory extends RouterFactory {
    @get({path: '/'})
    async route(req: express.Request, res: express.Response): Promise<any> {
      return {};
    }
  }

  @provider()
  @router({
    middleware: [
      {path: '/route', provider: 'test.Router'}
    ]
  })
  class TestServerFactory extends ServerFactory {
    @factory({key: 'express.Application'})
    public app(): express.Application {
      return super.app();
    }
  }

  @component({
    providers: [TestServerFactory, TestRouterFactory],
    dependencies: [Tashmetu]
  })
  class TestComponent {}

  let app = bootstrap(TestComponent).get<express.Application>('express.Application');

  it('should add router by key', (done) => {
    request(app).get('/route').expect(200, done);
  });
});
