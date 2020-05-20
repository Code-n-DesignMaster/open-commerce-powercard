import { BaseError } from './base.error';

export const OC_POWERCARD_BALANCE_SNAPSHOT_CREATION_FAILED_ERROR =
  'OC_POWERCARD_BALANCE_SNAPSHOT_CREATION_FAILED_ERROR';

export class OCPowercardBalanceSnapshotCreationFailedError extends BaseError {
  constructor(message: string) {
    super(
      `Failed to create powercard balanace snapshot for transaction: ${message}`,
      OC_POWERCARD_BALANCE_SNAPSHOT_CREATION_FAILED_ERROR,
    );
  }
}
