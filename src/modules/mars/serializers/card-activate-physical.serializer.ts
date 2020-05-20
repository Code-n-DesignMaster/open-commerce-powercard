import { CardActivatePhysicalRequestDto } from '../dto/CardActivatePhysicalRequest.dto';
import { ICardActivateResponse } from '../interfaces/ICardActivateResponse.interface';
import { MarsSerializer } from './mars.serializer';

export class CardActivatePhysicalSerializer extends MarsSerializer {
  public serialize(input: CardActivatePhysicalRequestDto) {
    this.logSerializing(input);

    const data = {
      CardEncoding: input.cardEncoding,
      RfidData: input.rfidData,
      CardNumber: parseInt(input.cardNumber, 10),
      Country: input.country,
      ItemIds: input.rateCardItemIds,
      DollarsPaid: input.dollarsPaid,
      StoreId: input.storeId,
      CreditCardToken: input.paymentInstrumentUuid,
      CreditCardType: input.paymentInstrumentType,
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
