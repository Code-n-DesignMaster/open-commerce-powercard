import { MarsSerializer } from './mars.serializer';
import { IStoreLocationsResponse } from '../interfaces/IStoreLocationsResponse.interface';

export class LocationsSerializer extends MarsSerializer {
  public deserialize({ data }): IStoreLocationsResponse {
    this.logReceived(data);

    const result = {
      locations: data.StoreList.map((location: any) => {
        return {
          storeNumber: location.StoreNumber,
          storeName: location.StoreName,
          address: location.Address,
          state: location.State,
          zip: location.Zip,
          phone: location.Phone,
          latitude: location.Latitude,
          longitude: location.Longitude,
          hours: location.Hours,
          specialHour: location.SpecialHours,
          city: location.City,
        };
      }),
    };

    this.logDeserialized(result);
    return result;
  }
}
