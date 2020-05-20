import { BaseError } from './BaseError';

export const OC_PAY_AT_TABLE_TRANSACTION_START_FAILED_BY_PAYMENT_ERROR =
  'OC_PAY_AT_TABLE_TRANSACTION_START_FAILED_BY_PAYMENT_ERROR';

export class OCPayAtTableTransactionStartFailedByPaymentError extends BaseError {
  constructor() {
    super(
      `Your payment could not be processed.`,
      OC_PAY_AT_TABLE_TRANSACTION_START_FAILED_BY_PAYMENT_ERROR,
    );
  }
}
