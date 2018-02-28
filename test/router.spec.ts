import {bootstrap, component, factory, provider, Injector} from '@ziggurat/tiamat';
import {ServerFactory} from '../src/factories/server';
import {RouterFactory} from '../src/factories/router';
import {get, post, router} from '../src/decorators';
import {Tashmetu} from '../src/index';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as request from 'supertest-as-promised';
import 'mocha';
import {expect} from 'chai';

describe('RouterFactory', () => {
  @provider({
    key: 'test.Router'
  })
  class TestRouterFactory extends RouterFactory {
    @get({path: '/'})
    private async route(req: express.Request, res: express.Response): Promise<any> {
      return {};
    }

    @post({path: '/post'})
    private async postRoute(req: express.Request, res: express.Response): Promise<any> {
      return req.body;
    }
  }

  function factProvider() {
    return (injector: Injector) => new TestRouterFactory();
  }

  @provider()
  @router({
    middleware: [
      {path: '*',       handler: bodyParser.json()},
      {path: '/route',  router: 'test.Router'},
      {path: '/route2', router: factProvider()}
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

  it('should add router factory by key', () => {
    return request(app).get('/route').expect(200);
  });

  it('should add router factory by provider', () => {
    return request(app).get('/route2').expect(200);
  });

  it('should post to router and recieve reply', () => {
    return request(app)
      .post('/route/post')
      .send({foo: 'bar'})
      .expect(200)
      .then(res => expect(res.body).to.eql({foo: 'bar'}));
  });
});
