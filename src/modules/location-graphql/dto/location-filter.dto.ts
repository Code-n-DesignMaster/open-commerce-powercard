import { LocationAttributeFilterDto } from './location-attribute-filter';
import { LocationResourceFilterDto } from './location-resource-filter.dto';
import { BrandFilterDto } from './brand-filter.dto';
import { OpenCommerceFeatureFilterDto } from './open-commerce-feature-filter.dto';
import { GeoLocationDto } from './geo-location.dto';

export class LocationFilterDto {
  public uuidEquals: string;
  public attributes: LocationAttributeFilterDto;
  public resources: LocationResourceFilterDto;
  public brand: BrandFilterDto;
  public openCommerceFeatures: OpenCommerceFeatureFilterDto;
  public radius: number;
  public geoLocationEquals: GeoLocationDto;
}
