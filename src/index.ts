import {component} from '@samizdatjs/tiamat';
import {DatabaseReporter, FileSystemReporter, RequestReporter} from './reporters';

export {FileSystem, file, directory, FileCollection, DirectoryCollection} from './fs';
export {yaml} from './yaml';
export {server, router, get, Server} from './server';
export {ReadOnlyRestProvider} from './rest';

import {FileSystemService, FileCollectionActivator, DirectoryCollectionActivator} from './fs';
import {ServerActivator} from './server';

@component({
  entities: [
    FileSystemService,
    ServerActivator,
    DatabaseReporter,
    FileSystemReporter,
    RequestReporter,
    FileCollectionActivator,
    DirectoryCollectionActivator
  ]
})
export class TashmetuServer {}
