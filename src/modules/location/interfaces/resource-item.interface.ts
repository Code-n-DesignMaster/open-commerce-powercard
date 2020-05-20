import { IResourceItemPrice } from './resource-item-price.interface';
import { RESOURCE_ITEM_TYPE } from '../constants/resource-item-type.enum';

export interface IResourceItem {
  readonly uuid: string;
  readonly sku: string;
  readonly description: string;
  readonly unitPrice: IResourceItemPrice;
  readonly itemType: RESOURCE_ITEM_TYPE;
  readonly merchandiseCode: string;
  readonly posCode: string;
  readonly posCodeModifier: string;
  readonly posCodeFormat: string;
  readonly unitOfMeasure: string;
  readonly receiptDescription: string;
}
