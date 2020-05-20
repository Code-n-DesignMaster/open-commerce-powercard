import { BaseError } from './base.error';

export const OC_POWERCARD_TRANSACTION_START_FAILED_BY_PAYMENT_ERROR =
  'OC_POWERCARD_TRANSACTION_START_FAILED_BY_PAYMENT_ERROR';

export class OCPowercardTransactionStartFailedByPaymentError extends BaseError {
  constructor(message: string) {
    super(message, OC_POWERCARD_TRANSACTION_START_FAILED_BY_PAYMENT_ERROR);
  }
}
