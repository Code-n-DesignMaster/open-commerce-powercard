import { ILocation } from '@open-commerce/data-objects';

export interface ILocationEdge {
  readonly cursor: string;
  readonly node: ILocation;
}
