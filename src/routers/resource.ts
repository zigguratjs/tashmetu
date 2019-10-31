import {Producer} from '@ziggurat/tiamat';
import {Collection, Database} from '@ziggurat/ziggurat';
import {SocketGateway} from '../gateway';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as SocketIO from 'socket.io';
import {serializeError} from 'serialize-error';
import {get, post, use, put, del} from '../decorators';
import {Router} from '../factories/router';

export interface ResourceConfig {
  collection: string;

  readOnly?: boolean;
}

/**
 * Create a resource request handler.
 *
 * This function creates a request handler that interacts with a Ziggurat database collection.
 */
export function resource(config: ResourceConfig): Producer<Router> {
  return container => {
    const instance = new Resource(
      container.resolve<Database>('ziggurat.Database').collection(config.collection),
      config.readOnly
    );
    container.resolve<SocketGateway>('tashmetu.SocketGateway')
      .register(instance, {namespace: '/ziggurat/' + config.collection});
    return instance;
  };
}

export class Resource extends Router {
  public constructor(
    protected collection: Collection,
    protected readOnly = false
  ) {
    super();
  }

  public onConnection(socket: SocketIO.Socket) {
    this.collection.on('document-upserted', doc => {
      socket.emit('document-upserted', doc, this.collection.name);
    });
    this.collection.on('document-removed', doc => {
      socket.emit('document-removed', doc, this.collection.name);
    });
    this.collection.on('document-error', err => {
      socket.emit('document-error', err, this.collection.name);
    });
  }

  @get('/')
  public async getAll(req: express.Request, res: express.Response) {
    return this.formResponse(res, 200, false, async () => {
      let selector = this.parseJson(req.query.selector);
      let options = this.parseJson(req.query.options);
      let count = await this.collection.count(selector);

      res.setHeader('X-total-count', count.toString());

      return this.collection.find(selector, options);
    });
  }

  @get('/:id')
  public async getOne(req: express.Request, res: express.Response) {
    return this.formResponse(res, 200, false, async () => {
      try {
        return await this.collection.findOne({_id: req.params.id});
      } catch (err) {
        res.statusCode = 404;
        return serializeError(err);
      }
    });
  }

  @post('/')
  @use(() => bodyParser.json())
  public async postOne(req: express.Request, res: express.Response) {
    return this.formResponse(res, 201, true, async () => {
      return this.collection.upsert(req.body);
    });
  }

  @put('/:id')
  @use(() => bodyParser.json())
  public async putOne(req: express.Request, res: express.Response) {
    return this.formResponse(res, 200, true, async () => {
      await this.collection.findOne({_id: req.params.id});
      return this.collection.upsert(req.body);
    });
  }

  @del('/:id')
  @use(() => bodyParser.json())
  public async deleteOne(req: express.Request, res: express.Response) {
    return this.formResponse(res, 200, true, async () => {
      const docs = await this.collection.remove({_id: req.params.id});
      if (docs.length === 0) {
        res.statusCode = 404;
        return Error('Document not found in collection');
      }
      return docs[0];
    });
  }

  private async formResponse(
    res: express.Response, statusCode: number, write: boolean, fn: () => Promise<any>
  ) {
    res.setHeader('Content-Type', 'application/json');

    if (this.readOnly && write) {
      res.statusCode = 403;
      return serializeError(new Error('Resource is read only'));
    }
    try {
      res.statusCode = statusCode;
      return await fn();
    } catch (err) {
      res.statusCode = 500;
      return serializeError(err);
    }
  }

  private parseJson(input: any): Object {
    try {
      return JSON.parse(input);
    } catch (e) {
      return {};
    }
  }
}
