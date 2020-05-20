import { MarsSerializer } from './mars.serializer';
import { CardDeactivateRequestDto } from '../dto/CardDeactivateRequest.dto';

export class CardDeactivateSerializer extends MarsSerializer {
  public serialize(input: CardDeactivateRequestDto): any {
    this.logSerializing(input);

    const data = {
      CardNumber: parseInt(input.cardNumber, 10),
      Country: input.country,
    };

    this.logSending(data);
    return data;
  }
}
