import { PAYMENT_INSTRUMENT_TYPE } from '@open-commerce/data-objects';

export class CardActivateDigitalRequestDto {
  public country: string = '';
  public rateCardItemIds: number[];
  public dollarsPaid: number;
  public storeId: number;
  public paymentInstrumentUuid: string;
  public paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE;
  public authorizationCode: string;
  public emailAddress: string;
}
