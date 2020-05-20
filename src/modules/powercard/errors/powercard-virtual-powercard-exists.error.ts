import { BaseError } from './base.error';

export const OC_POWERCARD_CUSTOMER_ALREADY_HAS_VIRTUAL_POWERCARD_ERROR =
  'OC_POWERCARD_CUSTOMER_ALREADY_HAS_VIRTUAL_POWERCARD_ERROR';

export class OCPowercardCustomerAlreadyHasVirtualPowercardError extends BaseError {
  constructor(uuid: string) {
    super(
      `Customer ${uuid} already has a virtual powercard.`,
      OC_POWERCARD_CUSTOMER_ALREADY_HAS_VIRTUAL_POWERCARD_ERROR,
    );
  }
}
