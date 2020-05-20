import { BaseError } from './BaseError';

export const OC_PAY_AT_TABLE_STORE_LOCATION_NOT_FOUND_ERROR =
  'OC_PAY_AT_TABLE_STORE_LOCATION_NOT_FOUND_ERROR';

export class OCPayAtTableStoreLocationNotFoundError extends BaseError {
  constructor(storeId: number) {
    super(
      `Could not find store location with storeId: ${storeId}`,
      OC_PAY_AT_TABLE_STORE_LOCATION_NOT_FOUND_ERROR,
    );
  }
}
