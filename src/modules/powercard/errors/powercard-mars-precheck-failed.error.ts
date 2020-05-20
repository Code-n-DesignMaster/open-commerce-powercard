import { BaseError } from './base.error';

export const OC_POWERCARD_MARS_PRECHECK_FAILED_ERROR =
  'OC_POWERCARD_MARS_PRECHECK_FAILED_ERROR';

export class OCPowercardMarsPrecheckFailedError extends BaseError {
  constructor(powercardUuid: string, message: string) {
    super(
      `MARS precheck failed for powercard with id: ${powercardUuid}, ${message}`,
      OC_POWERCARD_MARS_PRECHECK_FAILED_ERROR,
    );
  }
}
