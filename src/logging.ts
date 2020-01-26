import {RequestHandler} from 'express';
import onHeaders from 'on-headers';
import {Logger} from '@ziqquratu/ziqquratu';
import {RequestHandlerFactory} from './interfaces';

export class RequestLoggerFactory extends RequestHandlerFactory {
  public constructor() {
    super('tashmetu.Logger');
  }

  public create(path: string): RequestHandler {
    return this.resolve((logger: Logger) => {
      return (req, res, next) => {
        onHeaders(res, () => {
          const url = decodeURIComponent(req.originalUrl);
          logger.info(`${req.method} '${url}' ${res.statusCode}`);
        });
        next();
      }
    });
  }
}

export const requestLogger = () => new RequestLoggerFactory();
