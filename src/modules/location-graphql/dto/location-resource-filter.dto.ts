import { LOCATION_RESOURCE_TYPE } from '../../location/constants/location-resource-type.enum';
import { LOCATION_RESOURCE_STATUS } from '../../location/constants/location-resource-status.enum';
import { ResourceItemFilterDto } from './resource-item-filter.dto';

export class LocationResourceFilterDto {
  public typeEquals: LOCATION_RESOURCE_TYPE;
  public typeContains: LOCATION_RESOURCE_TYPE[];
  public items: ResourceItemFilterDto;
  public statusEquals: LOCATION_RESOURCE_STATUS;
  public statusContains: LOCATION_RESOURCE_STATUS[];
}
