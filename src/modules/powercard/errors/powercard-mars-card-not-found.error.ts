import { BaseError } from './base.error';

export const OC_POWERCARD_MARS_CARD_NOT_FOUND_ERROR =
  'OC_POWERCARD_MARS_CARD_NOT_FOUND_ERROR';

const message = 'MARS could not find powercard with id:';

export class OCPowercardMarsCardNotFoundError extends BaseError {
  constructor(powercardUuid: string) {
    super(
      `${message} ${powercardUuid}`,
      OC_POWERCARD_MARS_CARD_NOT_FOUND_ERROR,
    );
  }
}
