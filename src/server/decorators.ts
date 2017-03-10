import {RouterConfig, RouterMethodMetadata, RouterMethodConfig, HandlerDecorator} from './interfaces';

export function router(config: RouterConfig) {
  return function (target: any) {
    Reflect.defineMetadata('tiamat:provider', {
      for: config.providerFor,
      singleton: true,
      activator: 'tashmetu.Server'
    }, target);
    Reflect.defineMetadata('tashmetu:router', config, target);
  };
}

export function get(config: RouterMethodConfig): HandlerDecorator {
  return method('get', config);
}

function method(method: string, config: RouterMethodConfig): HandlerDecorator {
  return function (target: any, key: string, value: any) {
    let metadata: RouterMethodMetadata = {method, config, target, key};
    let metadataList: RouterMethodMetadata[] = [];

    if (!Reflect.hasOwnMetadata('tashmetu:router-method', target.constructor)) {
        Reflect.defineMetadata('tashmetu:router-method', metadataList, target.constructor);
    } else {
        metadataList = Reflect.getOwnMetadata('tashmetu:router-method', target.constructor);
    }

    metadataList.push(metadata);
  };
}
