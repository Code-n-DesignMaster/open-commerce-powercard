import { BaseError } from './BaseError';

export const OC_PAY_AT_TABLE_TABLE_NOT_FOUND_ERROR =
  'OC_PAY_AT_TABLE_TABLE_NOT_FOUND_ERROR';

export class OCPayAtTableTableNotFoundError extends BaseError {
  constructor(tableUuid: string) {
    super(
      `Could not find table with such tableUuid: ${tableUuid}`,
      OC_PAY_AT_TABLE_TABLE_NOT_FOUND_ERROR,
    );
  }
}
