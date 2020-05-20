import { OfferListRequestDto } from '../dto/OfferListRequest.dto';
import { RateCardSerializer } from './rate-card.serializer';
import { MarsSerializer } from './mars.serializer';
import { IOfferListResponse } from '../interfaces/IOfferListResponse.interface';
import { OFFER_TYPE } from '@open-commerce/data-objects';
import { offerTypeToBitmaskMap } from '../../powercard/constants/offer-type-map';

export class OfferListSerializer extends MarsSerializer {
  private rateCardSerializer = new RateCardSerializer();

  public serialize(input: OfferListRequestDto): any {
    this.logSerializing(input);

    const data = {
      StoreID: input.storeId,
      EmailAddress: input.emailAddress,
      IsNewUser: input.isNewCustomer,
      State: input.state,
      PaymentType: input.paymentType,
      ChipCount: input.chipCount,
      TicketCount: input.ticketCount,
    };

    this.logSending(data);
    return data;
  }

  public deserialize({ data }): IOfferListResponse {
    this.logReceived(data);

    const result = {
      offers: data.OfferList.map((marsOffer: any) => ({
        item: this.deserializeItem(marsOffer.Item),
        termsAndConditions: marsOffer.TermsAndConditions,
        offerId: marsOffer.OfferID,
        imageUrl: marsOffer.ImageUrl,
        offerAmount: marsOffer.OfferAmount,
        description: marsOffer.Description,
        validTo: new Date(marsOffer.ValidTo),
        title: marsOffer.Title,
        autoApply: marsOffer.AutoApply,
        disclaimer: marsOffer.Disclaimer,
        validFrom: new Date(marsOffer.ValidFrom),
        offerTypes: this.unpackOfferTypes(marsOffer.OfferType),
      })),
    };

    this.logDeserialized(result);
    return result;
  }

  private deserializeItem(data: any) {
    return this.rateCardSerializer.deserializeItem(data);
  }

  private unpackOfferTypes(marsOfferType: number) {
    const types: OFFER_TYPE[] = [];
    Object.keys(OFFER_TYPE).forEach(key => {
      // tslint:disable-next-line: no-bitwise
      if (marsOfferType & offerTypeToBitmaskMap[key]) {
        types.push(OFFER_TYPE[key]);
      }
    });

    return types.length === 0 ? [OFFER_TYPE.NONE] : types;
  }
}
