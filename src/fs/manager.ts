import {inject, service, Activator, Provider} from '@samizdatjs/tiamat';
import {Collection, LocalDatabase, Serializer, CollectionBase} from '@samizdatjs/tashmetu';
import {FileSystem, DirectoryConfig, FSStorageAdapter} from './interfaces';
import {basename, dirname, join} from 'path';
import {Directory} from './directory';
import {File} from './file';

@service({
  name: 'tashmetu.FSCollectionManager',
  singleton: true
})
export class FSCollectionManager implements Activator<CollectionBase> {
  private collections: {[name: string]: FSStorageAdapter} = {};
  private storing = '';

  public constructor(
    @inject('tiamat.Provider') private provider: Provider,
    @inject('tashmetu.LocalDatabase') private cache: LocalDatabase,
    @inject('tashmetu.FileSystem') private fs: FileSystem
  ) {
    fs.on('file-added', (path: string) => {
      this.update(path);
    });
    fs.on('file-changed', (path: string) => {
      this.update(path);
    });
  }

  public activate(obj: CollectionBase): any {
    if (Reflect.hasOwnMetadata('tashmetu:directory', obj.constructor)) {
      let config = Reflect.getOwnMetadata('tashmetu:directory', obj.constructor);
      let serializer = config.serializer(this.provider);
      let cache = this.cache.createCollection(config.name);

      obj.setCollection(cache);

      this.collections[config.path] = new Directory(
        cache, serializer, this.fs, config);
    } else {
      let config = Reflect.getOwnMetadata('tashmetu:file', obj.constructor);
      let serializer = config.serializer(this.provider);
      let cache = this.cache.createCollection(config.name);

      obj.setCollection(cache);

      this.collections[config.path] = new File(
        cache, serializer, this.fs, config);
    }

    return obj;
  }

  private getCollection(path: string): FSStorageAdapter {
    if (path.indexOf('/') > 0) {
      return this.collections[basename(dirname(path))];
    } else {
      return this.collections[path];
    }
  }

  private update(path: string): void {
    if (this.storing !== path) {
      let col = this.getCollection(path);
      if (col) {
        col.update(path);
      }
    } else {
      this.storing = '';
    }
  }
}
