export interface IRewardTransaction {
  transactionType: number;
  transactionDate: Date;
  numberOfPoints: number;
  numberOfChips: number;
  chipBalance: number;
  expirationDate: Date;
}
