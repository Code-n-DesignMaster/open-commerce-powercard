import { MarsSerializer } from './mars.serializer';
import { RewardsSetCardNumberRequestDto } from '../dto/RewardsSetCardNumberRequest.dto';

export class RewardsSetCardNumberSerializer extends MarsSerializer {
  public serialize(input: RewardsSetCardNumberRequestDto): any {
    this.logSerializing(input);

    const data = {
      EmailAddress: input.emailAddress,
      CardNumber: parseInt(input.cardNumber, 10),
    };

    this.logSending(data);
    return data;
  }
}
