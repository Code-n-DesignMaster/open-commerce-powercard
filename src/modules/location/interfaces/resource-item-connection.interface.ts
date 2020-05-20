import { IResourceItemEdge } from './resource-item-edge.interface';
import { IPageInfo } from './page-info.interface';

export interface IResourceItemConnection {
  readonly edges: IResourceItemEdge[];
  readonly pageInfo: IPageInfo;
}
