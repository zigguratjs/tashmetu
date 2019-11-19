import {Annotation} from '@ziggurat/tiamat';
import {Route, RouteMap, makeRoutes} from '../interfaces';

export class RouterAnnotation extends Annotation {
  public routes(controller: any): Route[] {
    return [];
  }
}

export class MiddlewareAnnotation extends RouterAnnotation {
  public constructor(
    private config: RouteMap
  ) { super(); }

  public routes(controller: any) {
    return makeRoutes(this.config);
  }
}
