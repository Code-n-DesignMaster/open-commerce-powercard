import { CONFIG_TOKEN, ConfigModule } from '@open-commerce/nestjs-config';
import { config } from '../../../config/config';
import {
  MARS_SERVICE_CONFIG,
  ENABLE_CONFIG_LOGGING,
} from '../../../config/config.constants';
import { MarsRequest } from '../mars-request';
MarsRequest.prototype.makeRequest = jest.fn();

import { Test } from '@nestjs/testing';
import { MarsCachingService } from '../../mars-caching/mars-caching.service';
import { LoggerService } from '@open-commerce/nestjs-logger';

import { MarsService } from '../mars.service';
import { OfferListRequestDto } from '../dto/OfferListRequest.dto';
import { OfferRedeemRequestDto } from '../dto/OfferRedeemRequest.dto';
import { RewardsAddMemberRequestDto } from '../dto/RewardsAddMemberRequest.dto';
import { RewardsSetCardNumberRequestDto } from '../dto/RewardsSetCardNumberRequest.dto';
import { RewardsUpdateEmailAddressRequestDto } from '../dto/RewardsUpdateEmailAddressRequest.dto';
import { RewardsUpdateMemberRequestDto } from '../dto/RewardsUpdateMemberRequest.dto';
import { CardRewardsHistoryRequestDto } from '../dto/CardRewardsHistoryRequest.dto';
import { RewardsUpdateOptInRequestDto } from '../dto/RewardsUpdateOptInRequest.dto';
import { RateCardRequestDto } from '../dto/RateCardRequest.dto';
import { CardActivateDigitalRequestDto } from '../dto/CardActivateDigitalRequest.dto';
import { PAYMENT_INSTRUMENT_TYPE } from '@open-commerce/data-objects';
import { CardDeactivateRequestDto } from '../dto/CardDeactivateRequest.dto';
import { CardReactivateRequestDto } from '../dto/CardReactivateRequest.dto';
import { CardRechargeRequestDto } from '../dto/CardRechargeRequest.dto';
import { CardValidateRequestDto } from '../dto/CardValidateRequest.dto';
import { CardBalancesMultipleRequestDto } from '../dto/CardBalancesMultipleRequest.dto';
// tslint:disable-next-line: no-var-requires
const uuidv4 = require('uuid/v4');
// import { mockRequestTokenResponse } from '../__mocks__/mock-request-token-response';
import { mockOffersResponse } from '../__mocks__/mock-offers-response';
import { mockRewardHistoryResponse } from '../__mocks__/mock-reward-history-response';
import { mockRateCardsResponse } from '../__mocks__/mock-rate-cards-response';
import { mockLocationsResponse } from '../__mocks__/mock-locations-response';

// Force UTC timezone
process.env.TZ = 'UTC';

const mockRedisService = {
  getByKey: () => ({}),
  deleteKey: () => ({}),
  storeByKey: () => ({}),
};

const mockMarsCachingService = {
  getRateCardInCache: () => null,
  storeRateCardInCache: () => null,
  getLocationsInCache: () => null,
  storeLocationsInCache: () => null,
  getBalancesInCacheForPowercard: () => null,
  storePowercardBalancesInCache: () => null,
  updatePowercardBalancesInCache: () => null,
  invalidatePowercardBalancesInCache: () => null,
};

describe('Mars Service', () => {
  let marsService = null;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(config)],
      providers: [
        MarsCachingService,
        MarsService,
        LoggerService,
        {
          provide: MARS_SERVICE_CONFIG,
          useFactory: config => {
            return config.mars;
          },
          inject: [CONFIG_TOKEN],
        },
        {
          provide: ENABLE_CONFIG_LOGGING,
          useValue: false,
        },
      ],
    })
      .overrideProvider('RedisService')
      .useValue(mockRedisService)
      .overrideProvider('MarsCachingService')
      .useValue(mockMarsCachingService)
      .compile();

    marsService = module.get<MarsService>(MarsService);
  });

  describe('offerList', () => {
    const mockInput = {
      storeId: 81,
      emailAddress: 'test2@daveandbusters.com',
      isNewCustomer: true,
      state: 'TX',
      paymentType: 1,
      chipCount: 0,
      ticketCount: 0,
    } as OfferListRequestDto;

    it('should return a list of offers', async () => {
      mockResponse(mockOffersResponse);

      const result = await marsService.offerList(mockInput);
      expect(result).toMatchSnapshot();
    });

    it('should always pass', async () => {
      expect(true).toBe(true);
    });
  });

  describe('offerRedeem', () => {
    const mockInput = {
      offerId: 1,
      // emailAddress: 'test2@daveandbusters.com',
      // isNewCustomer: true,
      // state: 'TX',
      // paymentType: 1,
      // chipCount: 0,
      // ticketCount: 0
    } as OfferRedeemRequestDto;

    it('should return success', async () => {
      mockResponse({});

      const result = await marsService.offerRedeem(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('rewardsAddMember', () => {
    const mockInput = {
      emailAddress: 'test2@daveandbusters.com',
      birthDate: new Date().toDateString(),
      preferredLocation: 81,
      phoneNumber: '+15555123456',
      firstName: 'TestFirst',
      lastName: 'TestLast',
      zipCode: '12345',
    } as RewardsAddMemberRequestDto;

    it('should return success', async () => {
      mockResponse({});

      const result = await marsService.rewardsAddMember(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('rewardsGetCardNumber', () => {
    const mockInput = {
      emailAddress: 'test2@daveandbusters.com',
    };

    it('should return a card number', async () => {
      mockResponse({
        CardNumber: '12345678',
      });

      const result = await marsService.rewardsGetCardNumber(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('rewardsSetCardNumber', () => {
    const mockInput = {
      emailAddress: 'test2@daveandbusters.com',
      cardNumber: '12345678',
    } as RewardsSetCardNumberRequestDto;

    it('should return success', async () => {
      mockResponse({});

      const result = await marsService.rewardsSetCardNumber(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('rewardsUpdateEmailAddress', () => {
    const mockInput = {
      oldEmailAddress: 'test2@daveandbusters.com',
      newEmailAddress: 'test3@daveandbusters.com',
    } as RewardsUpdateEmailAddressRequestDto;

    it('should return success', async () => {
      mockResponse({});

      const result = await marsService.rewardsUpdateEmailAddress(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('rewardsUpdateMember', () => {
    const mockInput = {
      emailAddress: 'test2@daveandbusters.com',
      birthDate: new Date().toDateString(),
      preferredLocation: 81,
      phoneNumber: '+15555123456',
      firstName: 'TestFirst',
      lastName: 'TestLast',
      zipCode: '12345',
    } as RewardsUpdateMemberRequestDto;

    it('should return success', async () => {
      mockResponse({});

      const result = await marsService.rewardsUpdateMember(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('cardRewardsHistory', () => {
    const mockInput = {
      cardNumber: '12345678',
      country: 'USA',
      lastPage: 0,
      emailAddress: 'test2@daveandbusters.com',
    } as CardRewardsHistoryRequestDto;

    it('should return a list of reward history items', async () => {
      mockResponse(mockRewardHistoryResponse);

      const result = await marsService.cardRewardsHistory(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('rewardsUpdateOptIn', () => {
    const mockInput = {
      emailAddress: 'test2@daveandbusters.com',
      optIn: true,
    } as RewardsUpdateOptInRequestDto;

    it('should return success', async () => {
      mockResponse({});

      const result = await marsService.rewardsUpdateOptIn(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('rateCards', () => {
    const mockInput = {
      storeId: 81,
      version: -1,
      isNewCustomer: true,
    } as RateCardRequestDto;

    it('should return a list of rate card items', async () => {
      mockResponse(mockRateCardsResponse);

      const result = await marsService.rateCards(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('storeLocations', () => {
    it('should return a list of store locations', async () => {
      mockResponse(mockLocationsResponse);

      const result = await marsService.storeLocations();
      expect(result).toMatchSnapshot();
    });
  });

  describe('cardActivateDigital', () => {
    const mockInput = {
      storeId: 81,
      rateCardItemIds: [2],
      paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
      paymentInstrumentUuid: uuidv4(),
      authorizationCode: uuidv4(),
      country: 'USA',
      dollarsPaid: 23.0,
      emailAddress: 'test2@daveandbusters.com',
    } as CardActivateDigitalRequestDto;

    it('should return a created power card', async () => {
      mockResponse({
        data: {
          IsRegistered: false,
          Country: 'USA',
          CardEncoding: '%S39ED3O8CQJG?',
          CardNumber: 1000000625,
          StoreID: 5,
          CardStatusID: 3,
        },
      });

      const result = await marsService.cardActivateDigital(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('cardDeActivate', () => {
    const mockInput = {
      cardNumber: '12345678',
      country: 'USA',
    } as CardDeactivateRequestDto;

    it('should return successful empty response', async () => {
      mockResponse({});

      const result = await marsService.cardDeActivate(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('cardReActivate', () => {
    const mockInput = {
      cardNumber: '12345678',
      country: 'USA',
    } as CardReactivateRequestDto;

    it('should return successful empty response', async () => {
      mockResponse({});

      const result = await marsService.cardReActivate(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('cardRecharge', () => {
    const mockInput = {
      storeId: 81,
      rateCardItemIds: [2],
      paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
      paymentInstrumentUuid: uuidv4(),
      authorizationCode: uuidv4(),
      country: 'USA',
      dollarsPaid: 23.0,
      emailAddress: 'test2@daveandbusters.com',
    } as CardRechargeRequestDto;

    it('should return an updated power card', async () => {
      mockResponse({
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

      const result = await marsService.cardRecharge(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('cardValidate', () => {
    const mockInput = {
      cardNumber: '12345678',
      pin: 1234,
    } as CardValidateRequestDto;

    it('should return success', async () => {
      mockResponse({
        data: {
          IsRegistered: true,
          StoreID: 0,
          CardStatusID: 3,
          CardEncoding: '%S35SP8ID2CJI?',
          CardNumber: '12345678',
          Country: 'USA',
        },
      });

      const result = await marsService.cardValidate(mockInput);
      expect(result).toMatchSnapshot();
    });
  });

  describe('cardBalancesMultiple', () => {
    const mockInput = {
      cards: [
        {
          cardNumber: '12345678',
          country: 'USA',
        },
      ],
    } as CardBalancesMultipleRequestDto;

    it('should return multiple card balances', async () => {
      mockResponse({
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

      const result = await marsService.cardBalancesMultiple(mockInput);
      expect(result).toMatchSnapshot();
    });
  });
});

const mockResponse = (response: any) => {
  MarsRequest.prototype.makeRequest = jest.fn().mockResolvedValueOnce(response);
};
