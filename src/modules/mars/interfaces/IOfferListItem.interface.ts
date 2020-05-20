import { IDaveAndBustersItem } from './IDaveAndBustersItem.interface';

export interface IOfferListItem {
  offerId: number;
  offerAmount: number;
  title: string;
  disclaimer: string;
  description: string;
  imageUrl: string;
  termsAndConditions: string;
  validTo: Date;
  validFrom: Date;
  item: IDaveAndBustersItem;
  autoApply: boolean;
}
