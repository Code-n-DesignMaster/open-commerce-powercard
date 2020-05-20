import { MarsSerializer } from './mars.serializer';
import { CardRewardsHistoryRequestDto } from '../dto/CardRewardsHistoryRequest.dto';
import { IRewardsHistoryItems } from '../interfaces/IRewardsHistoryItems.interface';
import { IRewardHistory } from '../interfaces/IRewardHistory.interface';
import { IRewardTransaction } from '../interfaces/IRewardTransaction.interface';

export class CardRewardsHistorySerializer extends MarsSerializer {
  public serialize(input: CardRewardsHistoryRequestDto): any {
    this.logSerializing(input);

    const data = {
      CardNumber: parseInt(input.cardNumber, 10),
      Country: input.country,
      LastPage: input.lastPage,
      EmailAddress: input.emailAddress,
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): IRewardHistory {
    this.logReceived(data);

    const result = {
      // BUGFIX:  HACK:
      // This is a workaround for incorrect value coming from MARS
      // rewardPoints: data.RewardPoints || 0,
      rewardPoints: 100 - data.PointsToNextReward,
      pointsToNextReward: data.PointsToNextReward,
      eligibleRewardCount: data.EligibleRewardCount,
      lastUpdated: new Date(data.LastUpdated),
      transactions: data.History.map(
        (item: IRewardsHistoryItems) =>
          ({
            transactionType: item.Type,
            transactionDate: new Date(item.Date),
            numberOfPoints: item.Points,
            numberOfChips: item.Chips,
            chipBalance: item.Balance,
            expirationDate: item.Expiration ? new Date(item.Expiration) : null,
          } as IRewardTransaction),
      ),
    };

    this.logDeserialized(result);
    return result;
  }
}
