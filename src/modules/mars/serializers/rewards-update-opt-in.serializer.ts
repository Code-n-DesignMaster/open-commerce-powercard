import { MarsSerializer } from './mars.serializer';
import { RewardsUpdateOptInRequestDto } from '../dto/RewardsUpdateOptInRequest.dto';

export class RewardsUpdateOptInSerializer extends MarsSerializer {
  public serialize(input: RewardsUpdateOptInRequestDto): any {
    this.logSerializing(input);

    const data = {
      EmailAddress: input.emailAddress,
      OptIn: input.optIn,
    };

    this.logSending(data);
    return data;
  }
}
