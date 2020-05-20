import { MarsSerializer } from './mars.serializer';
import { IApplyPaymentResponse } from '../interfaces/IApplyPaymentResponse.interface';
import { Receipt } from '@open-commerce/data-objects';
import { paymentInstrumentTypeMap } from '../mars.constants';
import { CheckDetailSerializer } from './check-detail.serializer';
import { ApplyPaymentRequestDto } from '../dto/ApplyPaymentRequest.dto';

export class ApplyPaymentSerializer extends MarsSerializer {
  private receiptSerializer = new CheckDetailSerializer();

  public serialize(input: ApplyPaymentRequestDto): any {
    this.logSerializing(input);

    const data = {
      StoreId: input.storeId,
      PayCode: input.payCode,
      Amount: input.dollarsPaid,
      ServiceCharge: input.tip,
      CreditCardToken: input.paymentInstrumentUuid,
      CreditCardType: paymentInstrumentTypeMap[input.paymentInstrumentType],
      AuthorizationCode: input.authorizationCode,
      EmailAddress: input.emailAddress,
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): IApplyPaymentResponse {
    this.logReceived(data);

    const { check } = this.receiptSerializer.deserialize({ data });

    const result = {
      receipt: check as Receipt,
    };

    this.logDeserialized(result);
    return result;
  }
}
