import { CardPrecheckRequestDto } from '../dto/CardPrecheckRequest.dto';
import { MarsSerializer } from './mars.serializer';

export class CardPrecheckSerializer extends MarsSerializer {
  public serialize(input: CardPrecheckRequestDto) {
    this.logSerializing(input);

    const data = {
      StoreID: input.storeId,
      ItemIDs: input.rateCardItemIds,
      DollarsPaid: input.dollarsPaid,
      CreditCardToken: input.paymentInstrumentUuid,
      IsActivation: input.isActivation,
    };

    this.logSending(data);
    return data;
  }
}
