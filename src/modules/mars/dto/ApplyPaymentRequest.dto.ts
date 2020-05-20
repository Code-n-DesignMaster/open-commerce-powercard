import { PAYMENT_INSTRUMENT_TYPE } from '@open-commerce/data-objects';

export class ApplyPaymentRequestDto {
  public storeId: number;
  public payCode: string;
  public dollarsPaid: number;
  public tip: number;
  public paymentInstrumentUuid: string;
  public paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE;
  public authorizationCode: string;
  public emailAddress: string;
}
