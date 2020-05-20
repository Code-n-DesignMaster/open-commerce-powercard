import { MarsSerializer } from './mars.serializer';
import { ICategoryListItem } from '../interfaces/ICategoryListItem.interface';
import { RateCardRequestDto } from '../dto/RateCardRequest.dto';
import { MarsApiError } from '../mars-error';
import { IRateCard, IRateCardItem } from '@open-commerce/data-objects';

export class RateCardSerializer extends MarsSerializer {
  public serialize(input: RateCardRequestDto) {
    this.logSerializing(input);

    const data = {
      StoreID: `${input.storeId}`,
      NewUser: input.isNewCustomer,
      Version: -1,
      PaymentTypeId: input.paymentType,
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): IRateCard {
    this.logReceived(data);

    try {
      const {
        // DiscountPercentage,
        Version,
        Global: {
          ActivationFee,
          ActivationItem,
          AttractionItemList,
          AttractionPrice,
        },
        CategoryList,
        MenuItemList,
        UpSellItemList,
      } = data;

      const result = {
        // TODO: ignore this for now
        // discountPercentage: DiscountPercentage,
        version: Version,
        activationFee: ActivationFee,
        activationItem: this.deserializeItem(ActivationItem),
        attractionItemList: AttractionItemList.map((item: any) =>
          this.deserializeItem(item),
        ),
        attractionPrice: AttractionPrice,
        categoryList: CategoryList.map((item: any) =>
          this.deserializeCategoryItem(item),
        ),
        menuItemList: MenuItemList.map((item: any) =>
          this.deserializeItem(item),
        ),
        upSellItemList: UpSellItemList.map((item: any) =>
          this.deserializeItem(item),
        ),
      };

      this.logDeserialized(result);
      return result;
    } catch (error) {
      throw new MarsApiError({
        message: 'Error Parsing Rate Card Response from MARS',
        marsErrorMessage: error.message,
      });
    }
  }

  public deserializeItem(data: any): IRateCardItem {
    return {
      itemId: data.ItemID,
      categoryId: data.CategoryID,
      chips: data.NumberOfChips || 0,
      price: data.Price,
      originalPrice: data.OriginalPrice,
      sequence: data.Sequence,
      isBestValue: data.IsBestValue,
      upSellId: data.UpSellID,
      color: data.Color,
    };
  }

  private deserializeCategoryItem(data: any): ICategoryListItem {
    return {
      sequence: data.Sequence,
      color: data.Color,
      categoryId: data.CategoryId,
      label: data.Label,
    };
  }
}
