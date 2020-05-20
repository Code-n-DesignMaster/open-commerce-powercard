import { IRewardTransaction } from './IRewardTransaction.interface';

export interface IRewardHistory {
  rewardPoints: number;
  lastUpdated: Date;
  pointsToNextReward: number;
  eligibleRewardCount: number;
  transactions: IRewardTransaction[];
}
