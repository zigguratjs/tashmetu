import {Collection, Database} from '@ziqquratu/ziqquratu';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as SocketIO from 'socket.io';
import {serializeError} from 'serialize-error';
import {get, post, put, del} from '../decorators';
import {router, ControllerFactory} from '../controller';

export interface ResourceConfig {
  collection: string;

  readOnly?: boolean;
}

export class ResourceFactory extends ControllerFactory {
  constructor(private config: ResourceConfig) {
    super('ziqquratu.Database');
  }

  public create(): any {
    return this.resolve((db: Database) => {
      return new Resource(db.collection(this.config.collection), this.config.readOnly);
    });
  }
}

/**
 * Create a resource request handler.
 *
 * This function creates a router that interacts with a Ziggurat database collection.
 */
export const resource = (config: ResourceConfig) => router(new ResourceFactory(config));

export class Resource {
  public constructor(
    protected collection: Collection,
    protected readOnly = false
  ) {}

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

  public toString(): string {
    return `Resource {collection: '${this.collection.name}', readOnly: '${false}'}`;
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

  @post('/', bodyParser.json())
  public async postOne(req: express.Request, res: express.Response) {
    return this.formResponse(res, 201, true, async () => {
      return this.collection.upsert(req.body);
    });
  }

  @put('/:id', bodyParser.json())
  public async putOne(req: express.Request, res: express.Response) {
    return this.formResponse(res, 200, true, async () => {
      await this.collection.findOne({_id: req.params.id});
      return this.collection.upsert(req.body);
    });
  }

  @del('/:id', bodyParser.json())
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
