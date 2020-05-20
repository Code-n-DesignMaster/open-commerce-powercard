import { BaseError } from './base.error';

export const OC_POWERCARD_TRANSACTION_START_FAILED_ERROR =
  'OC_POWERCARD_TRANSACTION_START_FAILED_ERROR';

export class OCPowercardTransactionStartFailedError extends BaseError {
  constructor(message: string) {
    super(message, OC_POWERCARD_TRANSACTION_START_FAILED_ERROR);
  }
}
