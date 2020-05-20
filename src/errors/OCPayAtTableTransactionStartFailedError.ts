import { BaseError } from './BaseError';

export const OC_PAY_AT_TABLE_TRANSACTION_START_FAILED_ERROR =
  'OC_PAY_AT_TABLE_TRANSACTION_START_FAILED_ERROR';

export class OCPayAtTableTransactionStartFailedError extends BaseError {
  constructor() {
    super(
      `Your payment could not be processed.`,
      OC_PAY_AT_TABLE_TRANSACTION_START_FAILED_ERROR,
    );
  }
}
