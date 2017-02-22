import {component} from '@samizdatjs/tiamat';
import {DatabaseReporter, FileSystemReporter, RequestReporter} from './reporters';

export {FileSystem, file, directory} from './fs';
export {yaml} from './yaml';
export {server, router, get, Server} from './server';
export {ReadOnlyRestProvider} from './rest';

import {FileSystemService, FSCollectionManager} from './fs';
import {ServerActivator} from './server';

@component({
  entities: [
    FileSystemService,
    ServerActivator,
    DatabaseReporter,
    FileSystemReporter,
    RequestReporter,
    FSCollectionManager
  ]
})
export class TashmetuServer {}
