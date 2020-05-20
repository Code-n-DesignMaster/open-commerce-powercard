import { MarsService } from '../mars/mars.service';
import { ILocationConnection } from './interfaces/location-connection.interface';
import { IStoreLocation } from '../mars/interfaces/IStoreLocation.interface';
import { Injectable, Inject } from '@nestjs/common';
import { IHoursOfOperation } from './interfaces/hours-of-operation.interface';
import { ILocationEdge } from './interfaces/location-edge.interface';
import { IContactPhoneNumber } from './interfaces/contact-phone-number.interface';
import { PHONE_TYPE } from './constants/phone-type.enum';
import { LocationFilterDto } from '../location-graphql/dto/location-filter.dto';
import { PhoneNumberUtil, PhoneNumberFormat } from 'google-libphonenumber';
import { sortBy, get } from 'lodash';
import { MARS_API_TOKEN } from '../mars/mars.constants';
import { GEOLIB_TOKEN } from './constants/location.constants';

const METERS_TO_MILES_MULTIPLIER = 0.000621371;
const DEFAULT_RADIUS = 100;

@Injectable()
export class LocationService {
  protected phoneUtil: PhoneNumberUtil;
  protected defaultPhoneNumberCountryCode = 'US';
  private isMarsInitialized = false;

  constructor(
    @Inject(MARS_API_TOKEN)
    private readonly marsService: MarsService,
    @Inject(GEOLIB_TOKEN)
    private readonly geolibService: any,
  ) {
    this.phoneUtil = PhoneNumberUtil.getInstance();
  }

  public async locations(
    filter: LocationFilterDto,
    refreshCache = false,
  ): Promise<ILocationConnection> {
    if (!this.isMarsInitialized) {
      await this.marsService.refreshToken();
      this.isMarsInitialized = true;
    }

    const locationEdges = [];
    const response = await this.marsService.storeLocations(refreshCache);

    response.locations.forEach((location: IStoreLocation) => {
      // This checks if both filter and filter.geoLocationEquals is null.
      if (get(filter, 'geoLocationEquals')) {
        const distance = this.distanceBetween(filter, location);

        if (distance < (filter.radius || DEFAULT_RADIUS)) {
          locationEdges.push(this.transformMarsLocation(location, distance));
        }
      } else {
        locationEdges.push(this.transformMarsLocation(location));
      }
    });

    // Sort by distance if filter is present, else location state.
    const sortedLocations = sortBy(locationEdges, [
      filter ? 'node.distance' : 'node.address.state',
    ]);

    return {
      edges: sortedLocations,
      pageInfo: {
        startCursor: '0',
        endCursor: '0',
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  public transformMarsLocation(location: IStoreLocation, distance?: number) {
    return {
      cursor: '0',
      node: {
        brandSpecificLocationId: location.storeNumber.toString(),
        address: {
          alias: location.storeName,
          street1: location.address,
          street2: null,
          city: location.city,
          state: location.state,
          zipCode: location.zip,
          geoLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
          },
        },
        attributes: null,
        resources: null,
        distance,
        brand: null,
        phoneNumbers: location.phone
          ? [this.getPhoneNumberFromLocation(location)]
          : [],
        openCommerceFeatures: null,
        hoursOfOperationGroup: {
          alias: null,
          hours: location.hours.map((marsHours: string) => ({
            dayOfWeek: null,
            openTime: null,
            closeTime: null,
            genericHoursString: marsHours,
          })) as IHoursOfOperation[],
        },
        specialHours: null,
      },
    } as ILocationEdge;
  }

  protected getPhoneNumberFromLocation(
    location: IStoreLocation,
  ): IContactPhoneNumber {
    const phoneNumber = this.phoneUtil.parseAndKeepRawInput(
      location.phone,
      this.defaultPhoneNumberCountryCode,
    );
    return {
      uuid: location.storeNumber.toString() || 'phone-uuid', // fast fix of DB-1245
      phoneNumber: this.phoneUtil.format(phoneNumber, PhoneNumberFormat.E164),
      phoneType: PHONE_TYPE.LOCATION,
    } as IContactPhoneNumber;
  }

  private distanceBetween(
    filter: LocationFilterDto,
    location: IStoreLocation,
  ): number {
    const distanceInMiles =
      this.geolibService.getDistance(
        {
          latitude: filter.geoLocationEquals.latitude,
          longitude: filter.geoLocationEquals.longitude,
        },
        {
          latitude: location.latitude,
          longitude: location.longitude,
        },
      ) * METERS_TO_MILES_MULTIPLIER;
    return distanceInMiles;
  }
}
