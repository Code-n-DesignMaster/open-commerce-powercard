export interface IRechargeResponse {
  gameChips: number;
  videoChips: number;
  rewardChips: number;
  attractionChips: number;
  tickets: number;
  rewardPoints: number;
  pointsToNextReward: number;
  eligibleRewardCount: number;
  cardEncoding?: string;
}
