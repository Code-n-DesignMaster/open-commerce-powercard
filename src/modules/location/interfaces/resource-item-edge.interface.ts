import { IResourceItem } from './resource-item.interface';

export interface IResourceItemEdge {
  readonly cursor: string;
  readonly node: IResourceItem;
}
