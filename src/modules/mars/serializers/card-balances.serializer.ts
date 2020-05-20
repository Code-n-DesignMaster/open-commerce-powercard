import { CardBalancesMultipleRequestDto } from '../dto/CardBalancesMultipleRequest.dto';
import { ICardBalancesMultipleResponse } from '../interfaces/ICardBalancesMultipleResponse.interface';
import { MarsSerializer } from './mars.serializer';

export class CardBalancesSerializer extends MarsSerializer {
  public serialize(input: CardBalancesMultipleRequestDto) {
    this.logSerializing(input);

    const data = {
      CardList: input.cards.map(powercard => ({
        CardNumber: parseInt(powercard.cardNumber, 10),
        Country: powercard.country,
      })),
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): ICardBalancesMultipleResponse {
    this.logReceived(data);

    const result = {
      balances: data.CardBalanceList.map((marsCard: any) => ({
        rewardPoints: marsCard.RewardPoints || 0,
        tickets: marsCard.Tickets,
        gameChips: marsCard.GameChips,
        storeId: marsCard.StoreID,
        country: marsCard.Country,
        isRegistered: marsCard.IsRegistered,
        cardNumber: `${marsCard.CardNumber}`,
        status: marsCard.Status,
        attractionChips: marsCard.AttractionChips,
        rewardChips: marsCard.RewardChips,
        pointsToNextReward: marsCard.PointsToNextReward,
        videoChips: marsCard.VideoChips,
        cardEncoding: marsCard.CardEncoding,
      })),
    };

    this.logDeserialized(result);
    return result;
  }
}
