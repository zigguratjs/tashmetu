import {Collection} from '@ziggurat/ziggurat';
import * as express from 'express';
import {serializeError} from 'serialize-error';
import {get} from '../decorators';
import {RouterFactory} from '../factories/router';

export class ReadOnlyResource extends RouterFactory {
  public constructor(protected collection: Collection) {
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

  private parseJson(input: any): Object {
    try {
      return JSON.parse(input);
    } catch (e) {
      return {};
    }
  }
}
