import {bootstrap, component, factory, provider, inject, Injector} from '@ziggurat/tiamat';
import {ServerFactory} from '../src/factories/server';
import {RouterFactory} from '../src/factories/router';
import {get, post, use, middleware, router} from '../src/decorators';
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
    private foo: string;

    public constructor() {
      super();
      this.foo = 'bar';
    }

    @get('/')
    private async route(req: express.Request, res: express.Response): Promise<any> {
      return {foo: this.foo};
    }

    @use(bodyParser.json())
    @post('/post')
    private async postRoute(req: express.Request, res: express.Response): Promise<any> {
      return req.body;
    }
  }

  @middleware([
    {path: '/route',  provider: router(i => i.get('test.Router'))},
    {path: '/route2', provider: router(() => new TestRouterFactory())}
  ])
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
  class TestComponent {
    @inject('express.Application') public app: express.Application;
  }

  let app: express.Application;

  before(async () => {
    app = (await bootstrap(TestComponent)).app;
  });

  it('should add router factory by key', () => {
    return request(app)
      .get('/route')
      .expect(200)
      .then(res => expect(res.body).to.eql({foo: 'bar'}));
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
