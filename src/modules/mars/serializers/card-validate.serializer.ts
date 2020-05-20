import { CardValidateRequestDto } from '../dto/CardValidateRequest.dto';
import { MarsSerializer } from './mars.serializer';
import { ICardValidateResponse } from '../interfaces/ICardValidateResponse.interface';

export class CardValidateSerializer extends MarsSerializer {
  public serialize(input: CardValidateRequestDto) {
    this.logSerializing(input);

    const data = {
      CardEncoding: input.cardEncoding,
      CardNumber: parseInt(input.cardNumber, 10),
      RfidData: input.rfidData,
      Pin: input.pin,
    };

    if (!data.CardNumber) {
      delete data.CardNumber;
    }

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): ICardValidateResponse {
    this.logReceived(data);

    const result = {
      storeId: data.StoreID,
      cardNumber: `${data.CardNumber}`,
      country: data.Country,
      cardEncoding: data.CardEncoding,
      cardStatusId: data.CardStatusID,
      isRegistered: data.IsRegistered,
    };

    this.logDeserialized(result);
    return result;
  }
}
