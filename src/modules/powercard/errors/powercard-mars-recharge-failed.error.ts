import { BaseError } from './base.error';

export const OC_POWERCARD_MARS_RECHARGE_FAILED_ERROR =
  'OC_POWERCARD_MARS_RECHARGE_FAILED_ERROR';

export class OCPowercardMarsRechargeFailedError extends BaseError {
  constructor(powercardUuid: string, message: string) {
    super(
      `MARS failed to recharge powercard with id: ${powercardUuid}, ${message}`,
      OC_POWERCARD_MARS_RECHARGE_FAILED_ERROR,
    );
  }
}
