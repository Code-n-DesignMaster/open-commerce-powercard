import { BaseError } from './base.error';

export const OC_POWERCARD_FAILED_TO_SAVE_ERROR =
  'OC_POWERCARD_FAILED_TO_SAVE_ERROR';

export class OCPowercardFailedToSaveError extends BaseError {
  constructor(powercardUuid: string, message: string) {
    super(
      `failed to persist powercard with id: ${powercardUuid} in the database, ${message}`,
      OC_POWERCARD_FAILED_TO_SAVE_ERROR,
    );
  }
}
