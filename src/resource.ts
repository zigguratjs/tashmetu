import {Producer} from '@ziggurat/tiamat';
import {Database} from '@ziggurat/ziggurat';
import {ReadOnlyResource} from './routers/readOnlyResource';
import {ReadWriteResource} from './routers/readWriteResource';
import {RouterFactory} from './factories/router';

export interface ResourceOptions {
  readOnly?: boolean;
}

export function resource(collectionName: string, options?: ResourceOptions): Producer<RouterFactory> {
  const {readOnly} = Object.assign({}, options, {readOnly: false});

  return container => {
    const collection = container.resolve<Database>('ziggurat.Database').collection(collectionName);
    return readOnly
      ? new ReadOnlyResource(collection)
      : new ReadWriteResource(collection);
  };
}
