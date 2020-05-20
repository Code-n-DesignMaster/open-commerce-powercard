import { LOCATION_RESOURCE_TYPE } from '../constants/location-resource-type.enum';
import { LOCATION_RESOURCE_STATUS } from '../constants/location-resource-status.enum';
import { IResourceItemConnection } from './resource-item-connection.interface';

export interface ILocationResource {
  readonly resourceType: LOCATION_RESOURCE_TYPE;
  readonly position: string;
  readonly status: LOCATION_RESOURCE_STATUS;
  readonly items: IResourceItemConnection[];
}
