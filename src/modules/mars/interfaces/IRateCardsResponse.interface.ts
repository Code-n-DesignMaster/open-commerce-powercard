import { IGlobalRateCard } from './IGlobalRateCard.interface';
import { IDaveAndBustersItem } from './IDaveAndBustersItem.interface';
import { ICategoryListItem } from './ICategoryListItem.interface';

export interface IRateCardsResponse {
  Global: IGlobalRateCard;
  CategoryList: ICategoryListItem[];
  MenuItemList: IDaveAndBustersItem[];
  UpSellItemList: IDaveAndBustersItem[];
}
