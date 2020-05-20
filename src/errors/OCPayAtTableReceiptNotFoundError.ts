import { BaseError } from './BaseError';

export const OC_PAY_AT_TABLE_RECEIPT_NOT_FOUND_ERROR =
  'OC_PAY_AT_TABLE_RECEIPT_NOT_FOUND_ERROR';

export class OCPayAtTableReceiptNotFoundError extends BaseError {
  constructor(storeId: number, payCode: string) {
    super(
      `Could not find receipt with storeId: ${storeId} and payCode: ${payCode}`,
      OC_PAY_AT_TABLE_RECEIPT_NOT_FOUND_ERROR,
    );
  }
}
