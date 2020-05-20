export interface ICardValidateResponse {
  storeId: number;
  cardNumber: string;
  country: string;
  cardEncoding: string;
  cardStatusId: number;
  isRegistered: boolean;
}
