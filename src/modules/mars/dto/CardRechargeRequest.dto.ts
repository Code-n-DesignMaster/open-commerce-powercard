export class CardRechargeRequestDto {
  public storeId: number;
  public cardNumber: string;
  public country: string = '';
  public rateCardItemIds: number[];
  public dollarsPaid: number;
  public paymentInstrumentUuid: string;
  public paymentInstrumentType: string;
  public authorizationCode: string;
  public emailAddress: string;
}
