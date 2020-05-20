import { BaseError } from './base.error';

export const OC_POWERCARD_MARS_GET_BALANCES_MULTIPLE_FAILED_ERROR =
  'OC_POWERCARD_MARS_GET_BALANCES_MULTIPLE_FAILED_ERROR';

export class OCPowercardMarsGetBalancesMultipleFailedError extends BaseError {
  constructor(uuids: string[], message: string) {
    super(
      `failed to get balances for card IDs: ${uuids} from MARS, ${message}`,
      OC_POWERCARD_MARS_GET_BALANCES_MULTIPLE_FAILED_ERROR,
    );
  }
}
