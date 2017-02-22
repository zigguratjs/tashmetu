import {Collection, Serializer} from '@samizdatjs/tashmetu';
import {FileSystem, FileConfig, FSCollection} from './interfaces';
import {each, pull, transform} from 'lodash';

export function file(config: FileConfig): any {
  return function (target: any) {
    Reflect.defineMetadata('tiamat:service', {
      name: config.name,
      singleton: true,
      activator: 'tashmetu.FSCollectionManager'
    }, target);
    Reflect.defineMetadata('tashmetu:file', config, target);
  };
}

export class File implements FSCollection {
  private upsertQueue: string[] = [];
  private storing = false;

  public constructor(
    private collection: Collection,
    private serializer: Serializer,
    private fs: FileSystem,
    private config: FileConfig
  ) {
    collection.on('document-upserted', (doc: any) => {
      if (this.upsertQueue.indexOf(doc._id) < 0) {
        collection.find({}, {}, (docs: any) => {
          let dict = transform(docs, (result: any, obj: any) => {
            result[doc._id] = obj;
          }, {});
          this.storing = true;
          fs.write(serializer.serialize(dict), config.path);
        });
      }
      pull(this.upsertQueue, doc._id);
    });

    this.update(config.path);
  }

  public update(path: string): void {
    if (!this.storing) {
      let dict = this.readFile();
      each(dict, (doc: any, id: string) => {
        doc._id = id;
        this.upsertQueue.push(id);
        this.collection.upsert(doc, () => {
          return;
        });
      });
    }
    this.storing = false;
  }

  private readFile(): Object {
    try {
      return this.serializer.parse(this.fs.read(this.config.path));
    } catch (e) {
      return {};
    }
  }
}
