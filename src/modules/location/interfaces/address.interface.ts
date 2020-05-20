import { IGeoLocation } from './geolocation.interface';

export interface IAddress {
  readonly alias: string;
  readonly street1: string;
  readonly street2: string;
  readonly city: string;
  readonly state: string;
  readonly zipCode: string;
  readonly geoLocation?: IGeoLocation;
}
