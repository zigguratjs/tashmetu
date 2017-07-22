import {Injector} from '@samizdatjs/tiamat';
import {Collection, Database} from '@samizdatjs/tashmetu';
import {get, RouterProvider} from '../server';
import * as express from 'express';

export function readOnly(collection: string): RouterProvider {
  return function(injector: Injector): any {
    let database = injector.get<Database>('tashmetu.Database');
    return new ReadOnlyRestRouter(database, collection);
  };
}

class ReadOnlyRestRouter {
  public constructor(private database: Database, private collection: string) {}

  @get({path: '/'})
  private getAll(req: express.Request, res: express.Response): void {
    let collection = this.database.collection(this.collection);
    let selector = this.parseJson(req.query.selector);
    let options = this.parseJson(req.query.options);

    collection.count(selector).then((count: number) => {
      collection.find(selector, options).then((result: any) => {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-total-count', count.toString());
        res.send(result);
      });
    });
  }

  @get({path: '/:id'})
  private getOne(req: express.Request, res: express.Response): void {
    let collection = this.database.collection(this.collection);
    collection.findOne({_id: req.params.id}).then((result: any) => {
      if (result) {
        res.setHeader('Content-Type', 'application/json');
        res.send(result);
      } else {
        res.status(500).send('No document named: ' + req.params.id);
      }
    });
  }

  private parseJson(input: any): Object {
    try {
      return JSON.parse(input);
    } catch (e) {
      return {};
    }
  }
}
