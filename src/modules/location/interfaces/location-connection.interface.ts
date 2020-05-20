import { ILocationEdge } from './location-edge.interface';
import { IPageInfo } from './page-info.interface';

export interface ILocationConnection {
  readonly edges: ILocationEdge[];
  readonly pageInfo: IPageInfo;
}
