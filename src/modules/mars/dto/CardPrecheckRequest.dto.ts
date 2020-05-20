export class CardPrecheckRequestDto {
  public storeId: number;
  public rateCardItemIds: number[];
  public dollarsPaid: number;
  public paymentInstrumentUuid: string;
  public isActivation: boolean = false;
}
