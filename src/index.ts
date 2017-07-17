import {component} from '@samizdatjs/tiamat';
import {DatabaseReporter} from './reporters';

export {Server, TransmitterConfig, MiddlewareProvider, router, get} from './server';
export {readOnly} from './rest';
export {requestReporter} from './reporters';

import {Server, Transmitter} from './server';

@component({
  providers: [
    Server,
    DatabaseReporter,
    Transmitter
  ]
})
export class TashmetuServer {}
