export class CardValidateRequestDto {
  public cardEncoding: string = '';
  public rfidData: string = '';
  public cardNumber: string = '';
  public pin: number;
}
