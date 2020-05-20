export class CardActivatePhysicalRequestDto {
  public cardEncoding: string = '';
  public rfidData: string = '';
  public cardNumber: string = '';
  public country: string = '';
  public rateCardItemIds: number[];
  public dollarsPaid: number;
  public storeId: number;
  public paymentInstrumentUuid: string;
  public paymentInstrumentType: number;
  public authorizationCode: string;
  public emailAddress: string;
}
