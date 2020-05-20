import { BaseError } from './base.error';

export const OC_POWERCARD_DUPLICATE_ERROR = 'OC_POWERCARD_DUPLICATE_ERROR';

export class OCPowercardDuplicateError extends BaseError {
  constructor(cardNumber: string) {
    super(
      `The Power Card with number ${cardNumber} already exists in your wallet`,
      OC_POWERCARD_DUPLICATE_ERROR,
    );
  }
}
