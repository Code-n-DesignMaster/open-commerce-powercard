import { BaseError } from '../modules/powercard/errors/base.error';

export const OC_PAY_AT_TABLE_COULD_NOT_CREATE_APP_RATING_ERROR =
  'OC_PAY_AT_TABLE_COULD_NOT_CREATE_APP_RATING_ERROR';
export class OCPayAtTableCouldNotCreateAppRatingError extends BaseError {
  constructor(message: string) {
    super(
      `Could not save rating in DB: ${message}`,
      OC_PAY_AT_TABLE_COULD_NOT_CREATE_APP_RATING_ERROR,
    );
  }
}
