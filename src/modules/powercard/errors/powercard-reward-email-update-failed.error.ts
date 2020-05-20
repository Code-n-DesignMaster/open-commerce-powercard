import { BaseError } from './base.error';

export const OC_POWERCARD_REWARD_EMAIL_UPDATE_FAILED_ERROR =
  'OC_POWERCARD_REWARD_EMAIL_UPDATE_FAILED_ERROR';

export class OCPowercardRewardEmailUpdateFailedError extends BaseError {
  constructor(message: string) {
    super(
      `Failed to update email address on rewards account in MARS: ${message}`,
      OC_POWERCARD_REWARD_EMAIL_UPDATE_FAILED_ERROR,
    );
  }
}
