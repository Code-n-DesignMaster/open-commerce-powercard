import { BaseError } from './base.error';

export const OC_POWERCARD_REWARD_MEMBER_UPDATE_FAILED_ERROR =
  'OC_POWERCARD_REWARD_MEMBER_UPDATE_FAILED_ERROR';

export class OCPowercardRewardMemberUpdateFailedError extends BaseError {
  constructor(message: string) {
    super(
      `Failed to update rewards account in MARS: ${message}`,
      OC_POWERCARD_REWARD_MEMBER_UPDATE_FAILED_ERROR,
    );
  }
}
