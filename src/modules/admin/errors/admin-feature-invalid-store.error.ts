import { BaseError } from '../../powercard/errors/base.error';

export const OC_ADMIN_FEATURE_INVALID_STORE_ERROR =
  'OC_ADMIN_FEATURE_INVALID_STORE_ERROR';

export class OCAdminFeatureInvalidStoreError extends BaseError {
  constructor() {
    super('Invalid store id', OC_ADMIN_FEATURE_INVALID_STORE_ERROR);
  }
}
