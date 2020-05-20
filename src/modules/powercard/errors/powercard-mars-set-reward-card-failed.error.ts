import { BaseError } from './base.error';

export const OC_POWERCARD_MARS_SET_REWARD_CARD_FAILED_ERROR =
  'OC_POWERCARD_MARS_SET_REWARD_CARD_FAILED_ERROR';

export class OCPowercardMarsSetRewardCardFailedError extends BaseError {
  constructor(powercardUuid: string, message: string) {
    super(
      `MARS failed to register powercard with id: ${powercardUuid} as the rewards card, ${message}`,
      OC_POWERCARD_MARS_SET_REWARD_CARD_FAILED_ERROR,
    );
  }
}
