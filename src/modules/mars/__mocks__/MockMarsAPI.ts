import { IPowercardOfferList } from '../interfaces/IPowercardOfferList.interface';
import { IMarsApiResponse } from '../interfaces/IMarsApiResponse.interface';
import { RewardsAddMemberRequestDto } from '../dto/RewardsAddMemberRequest.dto';
import { IRewardsGetCardNumberResponse } from '../interfaces/IRewardsGetCardNumberResponse.interface';
import { RewardsUpdateMemberRequestDto } from '../dto/RewardsUpdateMemberRequest.dto';
import { CardRewardsHistoryRequestDto } from '../dto/CardRewardsHistoryRequest.dto';
import { CardActivatePhysicalRequestDto } from '../dto/CardActivatePhysicalRequest.dto';
import { ICardActivateResponse } from '../interfaces/ICardActivateResponse.interface';
import { CardActivateDigitalRequestDto } from '../dto/CardActivateDigitalRequest.dto';
import { CardDeactivateRequestDto } from '../dto/CardDeactivateRequest.dto';
import { CardReactivateRequestDto } from '../dto/CardReactivateRequest.dto';
import { CardPrecheckRequestDto } from '../dto/CardPrecheckRequest.dto';
import { CardRechargeRequestDto } from '../dto/CardRechargeRequest.dto';
import { IRechargeResponse } from '../interfaces/IRechargeResponse.interface';
import { CardValidateRequestDto } from '../dto/CardValidateRequest.dto';
import { ICardValidateResponse } from '../interfaces/ICardValidateResponse.interface';
import { CardBalancesMultipleRequestDto } from '../dto/CardBalancesMultipleRequest.dto';
import { ICardBalancesMultipleResponse } from '../interfaces/ICardBalancesMultipleResponse.interface';
import { RewardsUpdateEmailAddressRequestDto } from '../dto/RewardsUpdateEmailAddressRequest.dto';
import { CardRewardsHistorySerializer } from '../serializers/card-rewards-history.serializer';
import { RewardsUpdateOptInRequestDto } from '../dto/RewardsUpdateOptInRequest.dto';
import { RateCardSerializer } from '../serializers/rate-card.serializer';
import { RateCardRequestDto } from '../dto/RateCardRequest.dto';
import { LocationsSerializer } from '../serializers/locations.serializer';
import { CardActivatePhysicalSerializer } from '../serializers/card-activate-physical.serializer';
import { CardActivateDigitalSerializer } from '../serializers/card-activate-digitial.serializer';
import { CardRechargeSerializer } from '../serializers/card-recharge.serializer';
import { CardValidateSerializer } from '../serializers/card-validate.serializer';
import { CardBalancesSerializer } from '../serializers/card-balances.serializer';
import { RewardsSetCardNumberRequestDto } from '../dto/RewardsSetCardNumberRequest.dto';
import { IStoreLocationsResponse } from '../interfaces/IStoreLocationsResponse.interface';
import { IRewardHistory } from '../interfaces/IRewardHistory.interface';
import { MarsApiError } from '../mars-error';
import { IRateCard } from '@open-commerce/data-objects';
import { OfferListRequestDto } from '../dto/OfferListRequest.dto';
import { OfferListSerializer } from '../serializers/offer-list.serializer';
import { OCPowercardRewardMemberCreateFailedError } from '../../powercard/errors/powercard-reward-member-create-failed.error';
import { OCPowercardRewardMemberUpdateFailedError } from '../../powercard/errors/powercard-reward-member-update-failed.error';
import { ICheckDetailResponse } from '../interfaces/ICheckDetailResponse.interface';
import { CheckDetailSerializer } from '../serializers/check-detail.serializer';
import { ICheckListResponse } from '../interfaces/ICheckListResponse.interface';
import { CheckListSerializer } from '../serializers/check-list.serializer';
import { IApplyPaymentResponse } from '../interfaces/IApplyPaymentResponse.interface';
import { ApplyPaymentSerializer } from '../serializers/apply-payment.serializer';
import { mockCheckResponse } from './mock-check-response';
import { mockCheckListResponse } from './mock-check-list-response';

export class MockMarsAPI {
  // =============================================================
  // MARS - OFFERS
  // =============================================================

  // MARS - /OfferList
  public async offerList(
    input: OfferListRequestDto,
  ): Promise<IPowercardOfferList> {
    const response = new OfferListSerializer().deserialize({
      data: {
        OfferList: [
          {
            Title: 'Free $10 w/ $10 Purchase',
            OfferID: 1,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_Mobile+Images_Double+Game+Play_V1+-+1372.jpg',
            OfferAmount: 10,
            AutoApply: true,
            Disclaimer: 'This is the disclaimer',
            ValidTo: '2019-12-31T00:00:00',
            TermsAndConditions: 'These are the Terms & Conditions',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#000000',
              UpSellID: 0,
              NumberOfChips: 96,
              Sequence: 0,
              OriginalPrice: 10,
              IsBestValue: false,
              Price: 10,
              ItemID: 38,
            },
            Description: 'Spend $10, Get $10 of Chips',
            ValidFrom: '2019-01-01T00:00:00',
            OfferType: 1550,
          },
          {
            Title: 'Buy $20, Get $20 Free!',
            OfferID: 2,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_MobileAppImage_DoubleYourFun_F-01.jpg',
            OfferAmount: 20,
            AutoApply: true,
            Disclaimer:
              // tslint:disable-next-line: max-line-length
              '*Promotional. EXPIRES: 8/27/2019. Limit one coupon per customer per Power Card®. Limited to in-app redemption only, not valid for in store redemption. Coupon value may not be divided into multiple Power Cards. Coupon valid for one use only. Minor policies vary by location – please check daveandbusters.com for details. Not valid with any other offers, including Eat & Play Combos, Half Price Games Wednesdays or any Half Price Game promotion. Not valid with Special Events Packages or on Virtual Reality games. NOT FOR RESALE.',
            ValidTo: '2020-08-07T00:00:00',
            TermsAndConditions: 'These are the Terms & Conditions',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#000000',
              UpSellID: 0,
              NumberOfChips: 200,
              Sequence: 0,
              OriginalPrice: 20,
              IsBestValue: false,
              Price: 20,
              ItemID: 39,
            },
            Description:
              '$20 Free Game Play* with $20 Power Card® Recharge through 8/27/2019.',
            ValidFrom: '2019-08-20T00:00:00',
            OfferType: 1550,
          },
          {
            Title: '$10 OFF $75',
            OfferID: 3,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_Mobile+Images_Double+Game+Play_V1+-+1372.jpg',
            OfferAmount: 10,
            AutoApply: true,
            Disclaimer: 'this is a test',
            ValidTo: '2019-11-21T00:00:00',
            TermsAndConditions: 'this is a test',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#41B6E6',
              UpSellID: 0,
              NumberOfChips: 550,
              Sequence: 0,
              OriginalPrice: 75,
              IsBestValue: false,
              Price: 65,
              ItemID: 73,
            },
            Description: '$10 OFF Your $75 Purchase',
            ValidFrom: '2019-06-20T00:00:00',
            OfferType: 1550,
          },
          {
            Title: 'Free $10 Game Play w/ $50 Purchase',
            OfferID: 4,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_Mobile+Images_Double+Game+Play_V1+-+1372.jpg',
            OfferAmount: 10,
            AutoApply: true,
            Disclaimer:
              // tslint:disable-next-line: max-line-length
              '<FPO> *Craveable Combo does not include tax and gratuity. Offer valid for a limited time only. Unlimited Video Game Play is valid only on day of purchase for non-redemption games and excludes all ticket redemption and Virtual Reality games. Not valid with other offers. Pricing varies by location. Menu selection may vary by location. Participation may vary. Restrictions apply. Void where prohibited. See store for details.',
            ValidTo: '2020-12-01T00:00:00',
            TermsAndConditions: 'These are the Terms & Conditions',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#41B6E6',
              UpSellID: 0,
              NumberOfChips: 300,
              Sequence: 0,
              OriginalPrice: 50,
              IsBestValue: false,
              Price: 40,
              ItemID: 74,
            },
            Description: '$10 Game Play added for FREE to your $50 Purchase',
            ValidFrom: '2019-01-01T00:00:00',
            OfferType: 1550,
          },
          {
            Title: '$10 OFF $50',
            OfferID: 6,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_Mobile+Images_Double+Game+Play_V1+-+1372.jpg',
            OfferAmount: 10,
            AutoApply: true,
            Disclaimer: 'this is a test',
            ValidTo: '2020-07-20T00:00:00',
            TermsAndConditions: 'this is a test',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#41B6E6',
              UpSellID: 0,
              NumberOfChips: 300,
              Sequence: 0,
              OriginalPrice: 50,
              IsBestValue: false,
              Price: 40,
              ItemID: 74,
            },
            Description: '$10 OFF Your $50 Purchase',
            ValidFrom: '2019-06-20T00:00:00',
            OfferType: 1550,
          },
          {
            Title: '20% OFF $75',
            OfferID: 7,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_Mobile+Images_Double+Game+Play_V1+-+1372.jpg',
            OfferAmount: 15,
            AutoApply: true,
            Disclaimer: 'this is a test',
            ValidTo: '2020-07-20T00:00:00',
            TermsAndConditions: 'this is a test',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#41B6E6',
              UpSellID: 0,
              NumberOfChips: 550,
              Sequence: 0,
              OriginalPrice: 75,
              IsBestValue: false,
              Price: 60,
              ItemID: 75,
            },
            Description: '20% OFF Your $75 Purchase',
            ValidFrom: '2019-06-20T00:00:00',
            OfferType: 1550,
          },
          {
            Title: '$10 Free Game Play',
            OfferID: 8,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_Mobile+Images_Double+Game+Play_V1+-+1372.jpg',
            OfferAmount: 10,
            AutoApply: true,
            Disclaimer: '',
            ValidTo: '2020-03-12T00:00:00',
            TermsAndConditions: '',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#000000',
              UpSellID: 0,
              NumberOfChips: 48,
              Sequence: 0,
              OriginalPrice: 10,
              IsBestValue: false,
              Price: 0,
              ItemID: 77,
            },
            Description: 'Get $10 Free Game Play - No Purchase Necessary!',
            ValidFrom: '2019-10-15T00:00:00',
            OfferType: 1550,
          },
          {
            Title: 'Buy $25, Get $25 Free!',
            OfferID: 10,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_MobileAppImage_DoubleYourFun_F-01.jpg',
            OfferAmount: 25,
            AutoApply: true,
            Disclaimer:
              // tslint:disable-next-line: max-line-length
              '*Promotional. EXPIRES: 8/27/2020. Limit one coupon per customer per Power Card®. Limited to in-app redemption only, not valid for in store redemption. Coupon value may not be divided into multiple Power Cards. Coupon valid for one use only. Minor policies vary by location – please check daveandbusters.com for details. Not valid with any other offers, including Eat & Play Combos, Half Price Games Wednesdays or any Half Price Game promotion. Not valid with Special Events Packages or on Virtual Reality games. NOT FOR RESALE.',
            ValidTo: '2020-08-27T00:00:00',
            TermsAndConditions: 'These are the Terms & Conditions',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#000000',
              UpSellID: 0,
              NumberOfChips: 270,
              Sequence: 0,
              OriginalPrice: 25,
              IsBestValue: false,
              Price: 25,
              ItemID: 80,
            },
            Description:
              '$25 Free Game Play* with $25 Power Card® Recharge through 8/27/2020.',
            ValidFrom: '2019-08-20T00:00:00',
            OfferType: 1550,
          },
          {
            Title: 'Apple Pay + Existing User',
            OfferID: 11,
            ImageUrl:
              'https://dave-busters-public.s3.amazonaws.com/offer-images/DB_Mobile+Images_Double+Game+Play_V1+-+1372.jpg',
            OfferAmount: 10,
            AutoApply: true,
            Disclaimer: 'This is the disclaimer',
            ValidTo: '2019-12-31T00:00:00',
            TermsAndConditions: 'These are the Terms & Conditions',
            Item: {
              NumberOfMinutes: 0,
              CategoryID: 0,
              Color: '#000000',
              UpSellID: 0,
              NumberOfChips: 96,
              Sequence: 0,
              OriginalPrice: 10,
              IsBestValue: false,
              Price: 10,
              ItemID: 38,
            },
            Description: 'Apple Pay + Existing User',
            ValidFrom: '2019-01-01T00:00:00',
            OfferType: 1676,
          },
        ],
      },
    });

    return response as IPowercardOfferList;
  }

  // MARS - /OfferRedeem
  public async offerRedeem(
    offerId: number,
    emailAddress: string,
  ): Promise<IMarsApiResponse> {
    return {
      success: true,
    };
  }

  // =============================================================
  // MARS - REWARDS
  // =============================================================

  // MARS - /RewardsAddMember
  public async rewardsAddMember(
    customerDetails: RewardsAddMemberRequestDto,
  ): Promise<IMarsApiResponse> {
    if (customerDetails.emailAddress.indexOf('another') === 0) {
      throw new OCPowercardRewardMemberCreateFailedError('Simulated Failure');
    }

    return {
      success: true,
    };
  }

  // MARS - /RewardsGetCardNumber
  public async rewardsGetCardNumber(
    emailAddress: string,
  ): Promise<IRewardsGetCardNumberResponse> {
    return {
      cardNumber: '1000000086',
    };
  }

  // MARS - /RewardsSetCardNumber
  public async rewardsSetCardNumber(
    input: RewardsSetCardNumberRequestDto,
  ): Promise<IMarsApiResponse> {
    return {
      success: true,
    };
  }

  // MARS - /RewardsUpdateEmailAddress
  public async rewardsUpdateEmailAddress(
    input: RewardsUpdateEmailAddressRequestDto,
  ): Promise<IMarsApiResponse> {
    return {
      success: true,
    };
  }

  // MARS - /RewardsUpdateMember
  public async rewardsUpdateMember(
    updatedCustomerDetails: RewardsUpdateMemberRequestDto,
  ): Promise<IMarsApiResponse> {
    if (updatedCustomerDetails.emailAddress.indexOf('another') === 0) {
      throw new OCPowercardRewardMemberUpdateFailedError('Simulated Failure');
    }

    return {
      success: true,
    };
  }
  // MARS - /CardRewardsHistory
  public async cardRewardsHistory(
    powercardAndPaginationDetails: CardRewardsHistoryRequestDto,
  ): Promise<IRewardHistory> {
    const response = new CardRewardsHistorySerializer().deserialize({
      data: {
        History: [
          {
            Points: 100,
            Date: new Date('2019-04-29T14:49:50.01'),
            Type: 1,
            Chips: null,
            Balance: 100,
            Expiration: null,
          },
          {
            Points: 12,
            Date: new Date('2019-04-30T08:18:35.293'),
            Type: 1,
            Chips: null,
            Balance: 112,
            Expiration: null,
          },
          {
            Points: 12,
            Date: new Date('2019-04-30T08:18:43.233'),
            Type: 1,
            Chips: null,
            Balance: 124,
            Expiration: null,
          },
        ],
        RewardPoints: 0,
        RewardChips: 0,
        PointsToNextReward: 76,
        LastUpdated: new Date('2019-04-30T05:00:00'),
        EligibleRewardCount: 1,
      },
    });

    return response;
  }

  // MARS - /RewardsUpdateEmailOptIn
  public async rewardsUpdateOptIn(
    input: RewardsUpdateOptInRequestDto,
  ): Promise<IMarsApiResponse> {
    return {
      success: true,
    };
  }

  // =============================================================
  // MARS - RATE CARDS
  // =============================================================

  // MARS - /RateCards
  public async rateCards(input: RateCardRequestDto): Promise<IRateCard> {
    const response = new RateCardSerializer().deserialize({
      data: {
        UpSellItemList: [
          {
            IsBestValue: true,
            CategoryID: 0,
            OriginalPrice: 23,
            Sequence: 0,
            NumberOfChips: 125,
            Color: '#0057B8',
            ItemID: 2,
            Price: 23,
            NumberOfMinutes: 0,
            UpSellID: 4,
          },
          {
            IsBestValue: false,
            CategoryID: 0,
            OriginalPrice: 29,
            Sequence: 0,
            NumberOfChips: 170,
            Color: '#0057B8',
            ItemID: 4,
            Price: 29,
            NumberOfMinutes: 0,
            UpSellID: 3,
          },
          {
            IsBestValue: false,
            CategoryID: 0,
            OriginalPrice: 40,
            Sequence: 0,
            NumberOfChips: 250,
            Color: '#0057B8',
            ItemID: 3,
            Price: 40,
            NumberOfMinutes: 0,
            UpSellID: 5,
          },
          {
            IsBestValue: true,
            CategoryID: 0,
            OriginalPrice: 56,
            Sequence: 0,
            NumberOfChips: 375,
            Color: '#0057B8',
            ItemID: 5,
            Price: 56,
            NumberOfMinutes: 0,
            UpSellID: 6,
          },
          {
            IsBestValue: false,
            CategoryID: 0,
            OriginalPrice: 75,
            Sequence: 0,
            NumberOfChips: 550,
            Color: '#0057B8',
            ItemID: 6,
            Price: 75,
            NumberOfMinutes: 0,
            UpSellID: 7,
          },
          {
            IsBestValue: true,
            CategoryID: 0,
            OriginalPrice: 100,
            Sequence: 0,
            NumberOfChips: 750,
            Color: '#0057B8',
            ItemID: 7,
            Price: 100,
            NumberOfMinutes: 0,
            UpSellID: 0,
          },
        ],
        CategoryList: [
          {
            Sequence: 1,
            Color: '#DC4405',
            CategoryId: 1,
            Label: 'Just Have Fun!',
          },
          {
            Sequence: 2,
            Color: '#DC4405',
            CategoryId: 2,
            Label: 'Better Value!',
          },
          {
            Sequence: 3,
            Color: '#DC4405',
            CategoryId: 3,
            Label: 'Mega Value!',
          },
        ],
        Global: {
          AttractionItemList: [
            {
              IsBestValue: false,
              CategoryID: 0,
              OriginalPrice: 5,
              Sequence: 1,
              NumberOfChips: 1,
              Color: '#DC4405',
              ItemID: 9,
              Price: 5,
              NumberOfMinutes: 0,
              UpSellID: 0,
            },
            {
              IsBestValue: false,
              CategoryID: 0,
              OriginalPrice: 10,
              Sequence: 2,
              NumberOfChips: 2,
              Color: '#DC4405',
              ItemID: 10,
              Price: 10,
              NumberOfMinutes: 0,
              UpSellID: 0,
            },
            {
              IsBestValue: false,
              CategoryID: 0,
              OriginalPrice: 15,
              Sequence: 3,
              NumberOfChips: 3,
              Color: '#DC4405',
              ItemID: 11,
              Price: 15,
              NumberOfMinutes: 0,
              UpSellID: 0,
            },
            {
              IsBestValue: false,
              CategoryID: 0,
              OriginalPrice: 20,
              Sequence: 4,
              NumberOfChips: 4,
              Color: '#DC4405',
              ItemID: 12,
              Price: 20,
              NumberOfMinutes: 0,
              UpSellID: 0,
            },
            {
              IsBestValue: false,
              CategoryID: 0,
              OriginalPrice: 25,
              Sequence: 5,
              NumberOfChips: 5,
              Color: '#DC4405',
              ItemID: 13,
              Price: 25,
              NumberOfMinutes: 0,
              UpSellID: 0,
            },
            {
              IsBestValue: false,
              CategoryID: 0,
              OriginalPrice: 30,
              Sequence: 6,
              NumberOfChips: 6,
              Color: '#DC4405',
              ItemID: 14,
              Price: 30,
              NumberOfMinutes: 0,
              UpSellID: 0,
            },
          ],
          ActivationItem: {
            IsBestValue: false,
            CategoryID: 0,
            OriginalPrice: 3,
            Sequence: 0,
            NumberOfChips: null,
            Color: '#000000',
            ItemID: 8,
            Price: 3,
            NumberOfMinutes: null,
            UpSellID: 0,
          },
          AttractionPrice: 5,
          ActivationFee: 3,
        },
        MenuItemList: [
          {
            IsBestValue: false,
            CategoryID: 1,
            OriginalPrice: 12,
            Sequence: 1,
            NumberOfChips: 60,
            Color: '#0057B8',
            ItemID: 1,
            Price: 12,
            NumberOfMinutes: 0,
            UpSellID: 2,
          },
          {
            IsBestValue: true,
            CategoryID: 1,
            OriginalPrice: 23,
            Sequence: 2,
            NumberOfChips: 125,
            Color: '#0057B8',
            ItemID: 2,
            Price: 23,
            NumberOfMinutes: 0,
            UpSellID: 4,
          },
          {
            IsBestValue: false,
            CategoryID: 2,
            OriginalPrice: 29,
            Sequence: 1,
            NumberOfChips: 170,
            Color: '#0057B8',
            ItemID: 4,
            Price: 29,
            NumberOfMinutes: 0,
            UpSellID: 3,
          },
          {
            IsBestValue: false,
            CategoryID: 2,
            OriginalPrice: 40,
            Sequence: 2,
            NumberOfChips: 250,
            Color: '#0057B8',
            ItemID: 3,
            Price: 40,
            NumberOfMinutes: 0,
            UpSellID: 5,
          },
          {
            IsBestValue: true,
            CategoryID: 2,
            OriginalPrice: 56,
            Sequence: 3,
            NumberOfChips: 375,
            Color: '#0057B8',
            ItemID: 5,
            Price: 56,
            NumberOfMinutes: 0,
            UpSellID: 6,
          },
          {
            IsBestValue: false,
            CategoryID: 3,
            OriginalPrice: 75,
            Sequence: 1,
            NumberOfChips: 550,
            Color: '#0057B8',
            ItemID: 6,
            Price: 75,
            NumberOfMinutes: 0,
            UpSellID: 7,
          },
          {
            IsBestValue: true,
            CategoryID: 3,
            OriginalPrice: 100,
            Sequence: 2,
            NumberOfChips: 750,
            Color: '#0057B8',
            ItemID: 7,
            Price: 100,
            NumberOfMinutes: 0,
            UpSellID: 0,
          },
        ],
      },
    });

    return response;
  }

  // =============================================================
  // MARS - LOCATIONS
  // =============================================================

  // MARS - /StoreLocations
  public async storeLocations(): Promise<IStoreLocationsResponse> {
    const response = new LocationsSerializer().deserialize({
      data: {
        StoreList: [
          {
            Address: '2700 Riverchase Galleria, Ste 110',
            SpecialHours: null,
            Phone: '(205) 986-6200',
            Latitude: 33.3790855,
            Zip: '35244',
            Longitude: -86.80809,
            State: 'Alabama',
            StoreNumber: 128,
            Hours: [
              'Sun - Thu 11:00am - Midnight',
              'Fri - Sat 11:00am - 2:00am',
            ],
            City: 'Birmingham',
            StoreName: 'AL, Birmingham',
          },
          {
            Address: '950 Makers Way NW',
            SpecialHours: null,
            Phone: null,
            Latitude: 34.73037,
            Zip: '35806',
            Longitude: -86.5861053,
            State: 'Alabama',
            StoreNumber: 144,
            Hours: [
              'Sun - Thu 11:00am - Midnight',
              'Fri - Sat 11:00am - 2:00am',
            ],
            City: 'Huntsville',
            StoreName: 'AL, Huntsville',
          },
          {
            Address: '800 E Dimond Blvd Ste 240',
            SpecialHours: null,
            Phone: '(907) 313-1430',
            Latitude: 61.14291,
            Zip: '99515',
            Longitude: -149.868347,
            State: 'Alaska',
            StoreNumber: 110,
            Hours: [
              'Sun - Thu 11:00am - Midnight',
              'Fri - Sat 11:00am - 2:00am',
            ],
            City: 'Anchorage',
            StoreName: 'AK, Anchorage',
          },
        ],
      },
    });

    return response;
  }

  // =============================================================
  // MARS - POWER CARDS
  // =============================================================

  // MARS - /CardActivate
  public async cardActivatePhysical(
    cardDetails: CardActivatePhysicalRequestDto,
  ): Promise<ICardActivateResponse> {
    const response = new CardActivatePhysicalSerializer().deserialize({
      data: {
        StoreID: 50,
        CardNumber: cardDetails.cardNumber,
        Country: 'USA',
        CardEncoding: '%S3QVV6AK9PMO?',
        CardStatusID: 3,
        IsRegistered: true,
      },
    });

    return response;
  }

  // MARS - /CardActivateDigital
  public async cardActivateDigital(
    cardDetails: CardActivateDigitalRequestDto,
  ): Promise<ICardActivateResponse> {
    if (!cardDetails.dollarsPaid) {
      throw new MarsApiError({
        message: 'Amount Due Mismatch',
      });
    }

    const response = new CardActivateDigitalSerializer().deserialize({
      data: {
        IsRegistered: false,
        Country: 'USA',
        CardEncoding: '%S39ED3O8CQJG?',
        CardNumber: 1000000625,
        StoreID: 0,
        CardStatusID: 3,
      },
    });

    return response;
  }

  // MARS - /CardDeActivate
  public async cardDeActivate(
    cardDetails: CardDeactivateRequestDto,
  ): Promise<IMarsApiResponse> {
    return {
      success: true,
    };
  }

  // MARS - /CardReActivate
  public async cardReActivate(
    cardDetails: CardReactivateRequestDto,
  ): Promise<IMarsApiResponse> {
    return {
      success: true,
    };
  }

  // MARS - /CardPreCheck
  public async cardPrecheck(
    powercardForPrecheckRequest: CardPrecheckRequestDto,
  ): Promise<IMarsApiResponse> {
    return {
      success: true,
    };
  }

  // MARS - /CardRecharge
  public async cardRecharge(
    rechargeDetails: CardRechargeRequestDto,
  ): Promise<IRechargeResponse> {
    const response = new CardRechargeSerializer().deserialize({
      data: {
        RewardChips: 0,
        PointsToNextReward: 76,
        AttractionChips: 0,
        RewardPoints: 124,
        Tickets: 0,
        VideoChips: 0,
        GameChips: 1590,
        EligibleRewardCount: 1,
      },
    });

    return response;
  }

  // MARS - /CardValidate
  public async cardValidate(
    powercardForValidateRequest: CardValidateRequestDto,
  ): Promise<ICardValidateResponse> {
    const response = new CardValidateSerializer().deserialize({
      data: {
        IsRegistered: true,
        StoreID: 0,
        CardStatusID: 3,
        CardEncoding: '%S35SP8ID2CJI?',
        CardNumber: powercardForValidateRequest.cardNumber,
        Country: 'USA',
      },
    });

    return response;
  }

  // MARS - /CardBalancesMultiple
  // NOTE: This request does NOT use the default axios timeout because of how long this call can take (up to 60 sec).
  // Instead it uses AXIOS_CARD_BALANCE_CHECK_TIMEOUT_MS.
  public async cardBalancesMultiple(
    powercards: CardBalancesMultipleRequestDto,
  ): Promise<ICardBalancesMultipleResponse> {
    const response = new CardBalancesSerializer().deserialize({
      data: {
        CardBalanceList: [
          {
            IsRegistered: false,
            Tickets: 0,
            PointsToNextReward: 76,
            GameChips: 1590,
            RewardPoints: 124,
            CardNumber: 1000000606,
            EligibleRewardCount: 1,
            RewardChips: 0,
            Country: 'USA',
            VideoChips: 0,
            StoreID: 1,
            Status: 200,
            AttractionChips: 0,
            CardEncoding: '%S3JOPNM3V2MF?',
          },
        ],
      },
    });

    return response;
  }

  public async applyPayment(input: any): Promise<IApplyPaymentResponse> {
    const response = new ApplyPaymentSerializer().deserialize({
      data: mockCheckResponse,
    });

    return response;
  }

  public async checkDetail(
    storeId: number,
    payCode: string,
  ): Promise<ICheckDetailResponse> {
    const response = new CheckDetailSerializer().deserialize({
      data: mockCheckResponse,
    });

    return response;
  }

  public async checkList(tableUuid: string): Promise<ICheckListResponse> {
    const response = new CheckListSerializer().deserialize({
      data: mockCheckListResponse,
    });

    return response;
  }

  // =============================================================
  // MARS - SESSION TOKEN
  // =============================================================
  // tslint:disable-next-line: no-empty
  public async refreshToken(): Promise<void> {}
}
