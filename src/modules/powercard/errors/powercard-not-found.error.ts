import { BaseError } from './base.error';

export const OC_POWERCARD_NOT_FOUND_ERROR = 'OC_POWERCARD_NOT_FOUND_ERROR';

export class OCPowercardNotFoundError extends BaseError {
  constructor(powercardUuid: string) {
    super(
      `could not find powercard with id: ${powercardUuid} in the database`,
      OC_POWERCARD_NOT_FOUND_ERROR,
    );
  }
}
