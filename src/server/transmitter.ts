import {inject, provider} from '@samizdatjs/tiamat';
import {Database} from '@samizdatjs/tashmetu';
import {Server} from './server';

export interface TransmitterConfig {
  collections: string[];
}

@provider({
  for: 'tashmetu.Transmitter',
  singleton: true
})
export class Transmitter {
  public constructor(
    @inject('tashmetu.Database') database: Database,
    @inject('tashmetu.Server') server: Server,
    @inject('tashmetu.TransmitterConfig') config: TransmitterConfig
  ) {
    database.on('database-synced', () => {
      server.io().on('connection', (socket: any) => {
        config.collections.forEach((name: string) => {
          database.collection(name).on('document-upserted', (doc: any) => {
            socket.emit('document-upserted', doc);
          });
          database.collection(name).on('document-removed', (doc: any) => {
            socket.emit('document-removed', doc);
          });
        });
      });
    });
  }
}
