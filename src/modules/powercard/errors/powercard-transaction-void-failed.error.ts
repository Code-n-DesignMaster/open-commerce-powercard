import { BaseError } from './base.error';

export const OC_POWERCARD_TRANSACTION_VOID_FAILED_ERROR =
  'OC_POWERCARD_TRANSACTION_VOID_FAILED_ERROR';

export class OCPowercardTransactionVoidFailedError extends BaseError {
  constructor(transactionUuid: string, message: string) {
    super(
      `failed to void transaction with id: ${transactionUuid} when calling out to transaction service from powercard service, ${message}`,
      OC_POWERCARD_TRANSACTION_VOID_FAILED_ERROR,
    );
  }
}
