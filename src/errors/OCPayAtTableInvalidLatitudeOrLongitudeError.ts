import { BaseError } from '../modules/powercard/errors/base.error';

export const OC_PAY_AT_TABLE_INVALID_LATITUDE_OR_LONGITUDE_ERROR =
  'OC_PAY_AT_TABLE_INVALID_LATITUDE_OR_LONGITUDE_ERROR';

export class OCPayAtTableInvalidLatitudeOrLongitudeError extends BaseError {
  constructor(message: string) {
    super(
      `Couldn't parse timezone from store location. Looks like invalid latitude and longitude. Error: ${message}`,
      OC_PAY_AT_TABLE_INVALID_LATITUDE_OR_LONGITUDE_ERROR,
    );
  }
}
