import {bootstrap, component} from '@ziggurat/tiamat';
import {memory} from '@ziggurat/ziggurat';
import {ServerFactory} from '../src/factories/server';
import {middleware} from '../src/decorators';
import Tashmetu, { resource } from '../src';
import * as express from 'express';
import * as request from 'supertest-as-promised';
import 'mocha';
import {expect} from 'chai';

describe('Resource', () => {
  @middleware({
    '/readonly': resource({collection: 'test', readOnly: true}),
    '/readwrite': resource({collection: 'test', readOnly: false}),
  })
  class TestServerFactory extends ServerFactory {}

  @component({
    providers: [TestServerFactory],
    dependencies: [Tashmetu, import('@ziggurat/ziggurat')],
    inject: ['express.Application'],
    instances: {
      'ziggurat.DatabaseConfig': {
        collections: {
          'test': memory([{_id: 'doc1'}, {_id: 'doc2'}])
        }
      }
    }
  })
  class TestComponent {
    constructor(
      public expressApp: express.Application,
    ) {}
  }

  let app: express.Application;

  before(async () => {
    app = (await bootstrap(TestComponent)).expressApp;
  });

  describe('get', () => {
    it('should get all documents', () => {
      return request(app)
        .get('/readonly')
        .expect(200)
        .then(res => expect(res.body).to.eql([{_id: 'doc1'}, {_id: 'doc2'}]));
    });

    it('should get a single document by id', () => {
      return request(app)
        .get('/readonly/doc1')
        .expect(200)
        .then(res => expect(res.body).to.eql({_id: 'doc1'}));
    });

    it('should return error when document not found', () => {
      return request(app)
        .get('/readonly/doc3')
        .expect(404)
        .then(res => expect(res.body.message).to.eql('Failed to find document in collection'));
    });
  });

  describe('post', () => {
    it('should fail on read only resource', () => {
      return request(app).post('/readonly').expect(403);
    });

    it('should create and return document', () => {
      return request(app)
        .post('/readwrite')
        .send({_id: 'doc3'})
        .expect(201)
        .then(res => expect(res.body).to.eql({_id: 'doc3'}));
    });

    it('should have added document to collection', () => {
      return request(app)
        .get('/readwrite/doc3')
        .expect(200)
        .then(res => expect(res.body).to.eql({_id: 'doc3'}));
    });
  });

  describe('put', () => {
    it('should fail on read only resource', () => {
      return request(app).put('/readonly/doc1').expect(403);
    });

    it('should update and return document', () => {
      return request(app)
        .put('/readwrite/doc3')
        .send({_id: 'doc3', foo: 'bar'})
        .expect(200)
        .then(res => expect(res.body).to.eql({_id: 'doc3', foo: 'bar'}));
    });

    it('should have updated document in collection', () => {
      return request(app)
        .get('/readwrite/doc3')
        .expect(200)
        .then(res => expect(res.body).to.eql({_id: 'doc3', foo: 'bar'}));
    });
  });

  describe('delete', () => {
    it('should fail on read only resource', () => {
      return request(app).delete('/readonly/doc1').expect(403);
    });

    it('should fail when document does not exist ', () => {
      return request(app)
        .delete('/readwrite/doc4')
        .expect(404);
    });

    it('should delete and return document', () => {
      return request(app)
        .delete('/readwrite/doc3')
        .expect(200)
        .then(res => expect(res.body).to.eql({_id: 'doc3', foo: 'bar'}));
    });

    it('should have modified the collection', () => {
      return request(app)
        .get('/readwrite/doc3')
        .expect(404)
        .then(res => expect(res.body.message).to.eql('Failed to find document in collection'));
    });
  });
});
