export class OfferListRequestDto {
  public storeId: number;
  public emailAddress: string;
  public isNewCustomer?: boolean;
  public state?: string;
  public paymentType?: number;
  public chipCount?: number;
  public ticketCount?: number;
}
