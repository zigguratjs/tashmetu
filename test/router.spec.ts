import {bootstrap, component, Lookup} from '@ziggurat/tiamat';
import {Router} from '../src/factories/router';
import {Server} from '../src/server';
import {get, post, use} from '../src/decorators';
import {ServerConfig} from '../src/interfaces';
import Tashmetu from '../src/index';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as request from 'supertest-as-promised';
import 'mocha';
import {expect} from 'chai';

describe('Router', () => {
  class TestRouter extends Router {
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

  @component({
    providers: [TestRouter],
    dependencies: [Tashmetu],
    instances: {
      'tashmetu.ServerConfig': {
        middleware: {
          '/route': Lookup.of(TestRouter),
          '/route2': new TestRouter(),
        }
      } as ServerConfig
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

  it('should add router by resolver', () => {
    return request(app)
      .get('/route')
      .expect(200)
      .then(res => expect(res.body).to.eql({foo: 'bar'}));
  });

  it('should add router by instance', () => {
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
