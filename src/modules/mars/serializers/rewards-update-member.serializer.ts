import { MarsSerializer } from './mars.serializer';
import { RewardsUpdateMemberRequestDto } from '../dto/RewardsUpdateMemberRequest.dto';

export class RewardsUpdateMemberSerializer extends MarsSerializer {
  public serialize(input: RewardsUpdateMemberRequestDto): any {
    this.logSerializing(input);

    const data = {
      EmailAddress: input.emailAddress,
      BirthDate: input.birthDate,
      PreferredLocation: input.preferredLocation,
      PhoneNumber: input.phoneNumber,
      FirstName: input.firstName,
      LastName: input.lastName,
      ZipCode: input.zipCode,
      OptIn: input.optIn,
    };

    this.logSending(data);
    return data;
  }
}
