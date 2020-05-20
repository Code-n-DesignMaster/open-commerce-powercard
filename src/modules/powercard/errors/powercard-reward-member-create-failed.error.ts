import { BaseError } from './base.error';

export const OC_POWERCARD_REWARD_MEMBER_CREATE_FAILED_ERROR =
  'OC_POWERCARD_REWARD_MEMBER_CREATE_FAILED_ERROR';

export class OCPowercardRewardMemberCreateFailedError extends BaseError {
  constructor(message: string) {
    super(
      `Failed to create rewards account in MARS: ${message}`,
      OC_POWERCARD_REWARD_MEMBER_CREATE_FAILED_ERROR,
    );
  }
}
