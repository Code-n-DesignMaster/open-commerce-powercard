import { BaseError } from './base.error';

export const OC_POWERCARD_CUSTOMER_UPDATE_FAILED_ERROR =
  'OC_POWERCARD_CUSTOMER_UPDATE_FAILED_ERROR';

export class OCPowercardCustomerUpdateFailedError extends BaseError {
  constructor(message: string) {
    super(message, OC_POWERCARD_CUSTOMER_UPDATE_FAILED_ERROR);
  }
}
