import { MarsSerializer } from './mars.serializer';
import { ICheckDetailResponse } from '../interfaces/ICheckDetailResponse.interface';
import { CHECK_LINE_ITEM_TYPE, ICheck } from '@open-commerce/data-objects';
const { TENDER, DISCOUNT, MENU_ITEM, REFERENCE, TIP } = CHECK_LINE_ITEM_TYPE;

export class CheckDetailSerializer extends MarsSerializer {
  public serialize(input: any): any {
    this.logSerializing({ input });

    const { storeId, payCode } = input;

    const data = {
      StoreID: storeId,
      PayCode: payCode,
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): ICheckDetailResponse {
    this.logReceived(data);

    const marsCheck = data.CheckDetail;
    const lineItems = marsCheck.CheckDetailLines || [];

    // set check's total amount due to 0 if it has negative value
    const due: number = marsCheck.Due > 0 ? marsCheck.Due : 0;
    const subTotal: number = marsCheck.SubTotal > 0 ? marsCheck.SubTotal : 0;

    const check = {
      cardNumber: marsCheck.CardNumber,
      checkNumber: marsCheck.CheckNumber,
      checkOpenTime: new Date(marsCheck.CheckOpenTime),
      checkSequence: marsCheck.CheckSequence,
      due,
      total: marsCheck.Payment + due,
      employeeNumber: marsCheck.EmployeeNumber,
      groupNumber: marsCheck.GroupNumber,
      guestCount: marsCheck.GuestCount,
      other: marsCheck.Other || 0,
      payCode: marsCheck.PayCode,
      payment: marsCheck.Payment,
      revenueCenter: marsCheck.RevenueCenter,
      statusId: marsCheck.StatusID,
      storeId: marsCheck.StoreID,
      subTotal,
      tableNumber: marsCheck.TableNumber,
      tax: marsCheck.Tax || 0,
      rewardPoints: null, // This gets populated elsewhere
      lineItems: lineItems
        .filter((lineItem: any) => lineItem.DetailType !== 'Extensibility')
        .map((lineItem: any) => {
          return {
            amount: lineItem.Amount,
            lineNumber: lineItem.LineNumber,
            description:
              lineItem.DetailType === 'Reference'
                ? lineItem.Reference
                : lineItem.Description,
            quantity: lineItem.Quantity,
            seat: lineItem.Seat,
            itemType: detailTypeMap[lineItem.DetailType],
          };
        }),
    } as ICheck;

    const result = {
      check,
    };

    this.logDeserialized(result);
    return result;
  }
}

const detailTypeMap = {
  MenuItem: MENU_ITEM,
  Reference: REFERENCE,
  Tender: TENDER,
  Discount: DISCOUNT,
  ServiceCharge: TIP,
};
