import {component} from '@samizdatjs/tiamat';
import {DatabaseReporter, FileSystemReporter, RequestReporter} from './reporters';

export {FileSystem, file, directory} from './fs';
export {yaml} from './yaml';
export {Server, router, get} from './server';
export {ReadOnlyRestProvider} from './rest';

import {FileSystemService, FSCollectionManager} from './fs';
import {Server} from './server';

@component({
  providers: [
    FileSystemService,
    Server,
    DatabaseReporter,
    FileSystemReporter,
    RequestReporter,
    FSCollectionManager
  ]
})
export class TashmetuServer {}
