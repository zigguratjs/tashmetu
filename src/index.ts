import {component} from '@samizdatjs/tiamat';
import {DatabaseReporter, FileSystemReporter} from './reporters';

export {FileSystem, file, directory} from './fs';
export {Server, TransmitterConfig, MiddlewareProvider, router, get} from './server';
export {readOnly} from './rest';
export {requestReporter} from './reporters';

import {FileSystemService, FSCollectionManager} from './fs';
import {Server, Transmitter} from './server';

@component({
  providers: [
    FileSystemService,
    Server,
    DatabaseReporter,
    FileSystemReporter,
    FSCollectionManager,
    Transmitter
  ]
})
export class TashmetuServer {}
