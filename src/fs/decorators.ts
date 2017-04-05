import {classDecorator, propertyDecorator, Injector} from '@samizdatjs/tiamat';
import {Serializer, ProviderFor, ProviderDecorator} from '@samizdatjs/tashmetu';

export interface FileSystemCollectionConfig extends ProviderFor {
  /**
   * Path to file/directory.
   */
  path: string;

  /**
   * A serializer provider creating a serializer that will parse and serialize
   * documents when reading from and writing to the file system.
   */
  serializer: (injector: Injector) => Serializer;
}

export interface DirectoryConfig extends FileSystemCollectionConfig {
  /**
   * file extension of files in the directory.
   */
  extension: string;
}

export const directory = classDecorator<DirectoryConfig>(
  new ProviderDecorator('tashmetu:directory', ['tashmetu.Directory']));

export interface FileConfig extends FileSystemCollectionConfig {}

export const file = classDecorator<FileConfig>(
  new ProviderDecorator('tashmetu:file', ['tashmetu.File']));
