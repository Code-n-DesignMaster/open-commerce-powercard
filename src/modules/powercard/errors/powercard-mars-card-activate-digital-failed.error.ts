import { BaseError } from './base.error';

export const OC_POWERCARD_MARS_CARD_ACTIVATE_DIGITAL_FAILED_ERROR =
  'OC_POWERCARD_MARS_CARD_ACTIVATE_DIGITAL_FAILED_ERROR';

export class OCPowercardMarsCardActivateDigitalFailedError extends BaseError {
  constructor(message: string) {
    super(
      `MARS failed to activate digital powercard: ${message}`,
      OC_POWERCARD_MARS_CARD_ACTIVATE_DIGITAL_FAILED_ERROR,
    );
  }
}
