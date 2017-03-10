import {Injector} from '@samizdatjs/tiamat';
import {MiddlewareProvider} from '../server';
import * as express from 'express';

let onHeaders = require('on-headers');
let chalk = require('chalk');
let log = require('fancy-log');

export function requestReporter(config: any): MiddlewareProvider {
  return function(injector: Injector): express.RequestHandler {
    return function(req: express.Request, res: express.Response, next: express.NextFunction): void {
      onHeaders(res, () => {
        function status(code: number): string {
          if (code < 200) {
            return chalk.cyan(code);
          } else if (code < 400) {
            return chalk.green(code);
          } else {
            return chalk.red(code);
          }
        }
        log(chalk.cyan(req.method) + ' ' + req.originalUrl + ' ' + status(res.statusCode));
      });
      next();
    };
  };
}
