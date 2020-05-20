import { IDaveAndBustersItem } from './IDaveAndBustersItem.interface';

export interface IGlobalRateCard {
  AttractionPrice: number;
  ActivationItem: IDaveAndBustersItem;
  ActivationFee: number;
  AttractionItemList: IDaveAndBustersItem[];
}
