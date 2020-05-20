import { IRechargeResponse } from '../interfaces/IRechargeResponse.interface';
import { CardRechargeRequestDto } from '../dto/CardRechargeRequest.dto';
import { MarsSerializer } from './mars.serializer';
import { paymentInstrumentTypeMap } from '../mars.constants';

export class CardRechargeSerializer extends MarsSerializer {
  public serialize(input: CardRechargeRequestDto): any {
    this.logSerializing(input);

    const data = {
      StoreID: input.storeId,
      CardNumber: parseInt(input.cardNumber, 10),
      Country: input.country,
      ItemIDs: input.rateCardItemIds,
      DollarsPaid: input.dollarsPaid,
      CreditCardToken: input.paymentInstrumentUuid,
      CreditCardType: paymentInstrumentTypeMap[input.paymentInstrumentType],
      AuthorizationCode: input.authorizationCode,
      EmailAddress: input.emailAddress,
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): IRechargeResponse {
    this.logReceived(data);

    const result = {
      gameChips: data.GameChips,
      videoChips: data.VideoChips,
      rewardChips: data.RewardChips,
      attractionChips: data.AttractionChips,
      tickets: data.Tickets,
      rewardPoints: data.RewardPoints || 0,
      pointsToNextReward: data.PointsToNextReward,
      eligibleRewardCount: data.EligibleRewardCount,
    };

    this.logDeserialized(result);
    return result;
  }
}
