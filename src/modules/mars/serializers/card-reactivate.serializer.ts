import { CardReactivateRequestDto } from '../dto/CardReactivateRequest.dto';
import { MarsSerializer } from './mars.serializer';

export class CardReactivateSerializer extends MarsSerializer {
  public serialize(input: CardReactivateRequestDto): any {
    this.logSerializing(input);

    const data = {
      CardNumber: parseInt(input.cardNumber, 10),
      Country: input.country,
    };

    this.logSending(data);
    return data;
  }
}
