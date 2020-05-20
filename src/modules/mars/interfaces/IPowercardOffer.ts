import { IRateCardItem, OFFER_TYPE } from '@open-commerce/data-objects';

export interface IPowercardOffer {
  offerId: number;
  offerTypes: OFFER_TYPE[];
  title: string;
  description: string;
  offerAmount: number;
  imageUrl: string;
  validFrom: Date;
  validTo: Date;
  disclaimer: string;
  termsAndConditions: string;
  autoApply: boolean;
  item: IRateCardItem;
}
