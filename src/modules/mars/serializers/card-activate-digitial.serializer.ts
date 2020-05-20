import { CardActivateDigitalRequestDto } from '../dto/CardActivateDigitalRequest.dto';
import { ICardActivateResponse } from '../interfaces/ICardActivateResponse.interface';
import { MarsSerializer } from './mars.serializer';
import { paymentInstrumentTypeMap } from '../mars.constants';

export class CardActivateDigitalSerializer extends MarsSerializer {
  public serialize(input: CardActivateDigitalRequestDto): any {
    this.logSerializing(input);

    const data = {
      Country: input.country,
      ItemIDs: input.rateCardItemIds,
      DollarsPaid: input.dollarsPaid,
      StoreID: input.storeId,
      CreditCardToken: input.paymentInstrumentUuid,
      CreditCardType: paymentInstrumentTypeMap[input.paymentInstrumentType],
      AuthorizationCode: input.authorizationCode,
      EmailAddress: input.emailAddress,
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): ICardActivateResponse {
    this.logReceived(data);

    const result = {
      attractionChips: data.AttractionChips,
      gameChips: data.GameChips,
      pointsToNextReward: data.PointsToNextReward,
      rewardChips: data.RewardChips,
      rewardPoints: data.RewardPoints || 0,
      tickets: data.Tickets,
      videoChips: data.VideoChips,
      storeId: data.StoreID,
      cardNumber: data.CardNumber.toString(),
      country: data.Country,
      cardEncoding: data.CardEncoding,
      cardStatusId: data.CardStatusID,
      isRegistered: data.IsRegistered,
    };

    this.logDeserialized(result);
    return result;
  }
}
