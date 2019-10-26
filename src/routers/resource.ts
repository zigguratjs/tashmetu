import {Producer} from '@ziggurat/tiamat';
import {Collection, Database} from '@ziggurat/ziggurat';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import {serializeError} from 'serialize-error';
import {get, post, use} from '../decorators';
import {RouterFactory} from '../factories/router';

export interface ResourceConfig {
  collection: string;

  readOnly?: boolean;
}

/**
 * Create a resource request handler.
 *
 * This function creates a request handler that interacts with a Ziggurat database collection.
 */
export function resource(config: ResourceConfig): Producer<RouterFactory> {
  return container => {
    return new Resource(
      container.resolve<Database>('ziggurat.Database').collection(config.collection),
      config.readOnly
    );
  };
}

export class Resource extends RouterFactory {
  public constructor(
    protected collection: Collection,
    protected readOnly = false
  ) {
    super();
  }

  @get('/')
  public async getAll(req: express.Request, res: express.Response) {
    let selector = this.parseJson(req.query.selector);
    let options = this.parseJson(req.query.options);
    let count = await this.collection.count(selector);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-total-count', count.toString());

    return await this.collection.find(selector, options);
  }

  @get('/:id')
  public async getOne(req: express.Request, res: express.Response) {
    try {
      res.setHeader('Content-Type', 'application/json');
      return await this.collection.findOne({_id: req.params.id});
    } catch (err) {
      res.status(500);
      return serializeError(err);
    }
  }

  @post('/')
  @use(() => bodyParser.json())
  public async postOne(req: express.Request, res: express.Response) {
    if (this.readOnly) {
      res.statusCode = 403;
      return serializeError(new Error('Resource is read only'));
    } else {
      try {
        let result = await this.collection.upsert(req.body);
        res.statusCode = 200;
        return result;
      } catch (err) {
        res.statusCode = 500;
        return serializeError(err);
      }
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
