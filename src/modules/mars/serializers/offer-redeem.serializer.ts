import { MarsSerializer } from './mars.serializer';
import { OfferRedeemRequestDto } from '../dto/OfferRedeemRequest.dto';

export class OfferRedeemSerializer extends MarsSerializer {
  public serialize(input: OfferRedeemRequestDto): any {
    this.logSerializing(input);

    const data = {
      OfferID: input.offerId,
      EmailAddress: input.emailAddress,
    };

    this.logSending(data);
    return data;
  }
}
