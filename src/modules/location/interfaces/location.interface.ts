import { IAddress } from './address.interface';
import { ILocationAttribute } from './location-attribute.interface';
import { ILocationResource } from './location-resource.interface';
import { IBrand } from './brand.interface';
import { IContactPhoneNumber } from './contact-phone-number.interface';
import { IOpenCommerceFeature } from './open-commerce-feature.interface';
import { IHoursOfOperationGroup } from './hours-of-operation-group.interface';

export interface ILocation {
  brandSpecificLocationId: string;
  address: IAddress;
  attributes: ILocationAttribute[];
  resources?: ILocationResource[];
  distance: number;
  brand: IBrand;
  phoneNumbers: IContactPhoneNumber[];
  openCommerceFeatures: IOpenCommerceFeature[];
  hoursOfOperationGroup: IHoursOfOperationGroup;
  specialHours: string;
}
