import { RESOURCE_ITEM_TYPE } from '../../location/constants/resource-item-type.enum';

export class ResourceItemFilterDto {
  public uuid: string;
  public skuContains: string;
  public skuEquals: string;
  public descriptionContains: string;
  public descriptionEquals: string;
  public unitPriceMin: number;
  public unitPriceMax: number;
  public unitPriceEquals: number;
  public itemTypeEquals: RESOURCE_ITEM_TYPE;
  public itemTypeContains: RESOURCE_ITEM_TYPE[];
  public merchandiseCodeContains: string;
  public merchandiseCodeEquals: string;
  public posCodeContains: string;
  public posCodeEquals: string;
  public posCodeModifierContains: string;
  public posCodeModifierEquals: string;
  public posCodeFormatContains: string;
  public posCodeFormatEquals: string;
  public unitOfMeasureContains: string;
  public unitOfMeasureEquals: string;
  public receiptDescriptionContains: string;
  public receiptDescriptionEquals: string;
}
