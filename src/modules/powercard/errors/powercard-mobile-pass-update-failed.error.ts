import { BaseError } from './base.error';

export const OC_POWERCARD_MOBILE_PASS_UPDATE_FAILED_ERROR =
  'OC_POWERCARD_MOBILE_PASS_UPDATE_FAILED_ERROR';

export class OCPowercardMobilePassUpdateFailedError extends BaseError {
  constructor(message: string) {
    super(
      `Failed to update balance on mobile pass: ${message}`,
      OC_POWERCARD_MOBILE_PASS_UPDATE_FAILED_ERROR,
    );
  }
}
