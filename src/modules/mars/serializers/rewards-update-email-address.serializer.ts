import { MarsSerializer } from './mars.serializer';
import { RewardsUpdateEmailAddressRequestDto } from '../dto/RewardsUpdateEmailAddressRequest.dto';

export class RewardsUpdateEmailAddressSerializer extends MarsSerializer {
  public serialize(input: RewardsUpdateEmailAddressRequestDto): any {
    this.logSerializing(input);

    const data = {
      OldEmailAddress: input.oldEmailAddress,
      NewEmailAddress: input.newEmailAddress,
    };

    this.logSending(data);
    return data;
  }
}
