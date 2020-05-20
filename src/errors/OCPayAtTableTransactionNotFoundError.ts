import { BaseError } from './BaseError';

export const OC_PAY_AT_TABLE_TRANSACTION_NOT_FOUND_ERROR =
  'OC_PAY_AT_TABLE_TRANSACTION_NOT_FOUND_ERROR';

export class OCPayAtTableTransactionNotFoundError extends BaseError {
  constructor(transactionUuid: string) {
    super(
      `Could not find transaction with such transactionUuid: ${transactionUuid}`,
      OC_PAY_AT_TABLE_TRANSACTION_NOT_FOUND_ERROR,
    );
  }
}
