import { IPowercardOffer } from './IPowercardOffer';
import { IRateCardItem } from '@open-commerce/data-objects';

export interface IPowercardOfferListResponse {
  readonly activationFee: number;
  readonly activationItem: IRateCardItem;
  readonly offerList: IPowercardOffer[];
}
