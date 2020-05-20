import { MarsSerializer } from './mars.serializer';
import { RewardsAddMemberRequestDto } from '../dto/RewardsAddMemberRequest.dto';

export class RewardsAddMemberSerializer extends MarsSerializer {
  public serialize(input: RewardsAddMemberRequestDto): any {
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
