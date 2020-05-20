import { BaseError } from './base.error';

export const OC_POWERCARD_RATE_CARD_ITEMS_NOT_FOUND_ERROR =
  'OC_POWERCARD_RATE_CARD_ITEMS_NOT_FOUND_ERROR';

export class OCPowercardRateCardItemsNotFoundError extends BaseError {
  constructor(ids: number[], error?: any) {
    super(
      `failed to find one or more rate cards with ids: ${ids}${
        error && !(error instanceof OCPowercardRateCardItemsNotFoundError)
          ? ' Error: ' + error
          : ''
      }`,
      OC_POWERCARD_RATE_CARD_ITEMS_NOT_FOUND_ERROR,
    );
  }
}
