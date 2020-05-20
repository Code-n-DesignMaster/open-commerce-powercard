import { BaseError } from '../modules/powercard/errors/base.error';

export const OC_PAY_AT_TABLE_COULD_NOT_SEND_RECEIPT_EMAIL =
  'OC_PAY_AT_TABLE_COULD_NOT_SEND_RECEIPT_EMAIL';

export class OCPayAtTableCouldNotSendEmailReceiptError extends BaseError {
  constructor(message: string) {
    super(
      `Could not send email receipt: ${message}`,
      OC_PAY_AT_TABLE_COULD_NOT_SEND_RECEIPT_EMAIL,
    );
  }
}
