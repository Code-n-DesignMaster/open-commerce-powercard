import { MarsService } from '../mars.service';
import { MarsCachingModule } from '../../mars-caching/mars-caching.module';

import { MarsApiError } from '../mars-error';
import { CARD_STATUS_OPEN } from '../mars.constants';

import { CardBalanceRequestDto } from '../dto/CardBalanceRequest.dto';
import { RewardsAddMemberRequestDto } from '../dto/RewardsAddMemberRequest.dto';
import { RewardsUpdateMemberRequestDto } from '../dto/RewardsUpdateMemberRequest.dto';
import { CardRewardsHistoryRequestDto } from '../dto/CardRewardsHistoryRequest.dto';
import { CardBalancesMultipleRequestDto } from '../dto/CardBalancesMultipleRequest.dto';
import { CardActivateDigitalRequestDto } from '../dto/CardActivateDigitalRequest.dto';
import { CardRechargeRequestDto } from '../dto/CardRechargeRequest.dto';
import { CardValidateRequestDto } from '../dto/CardValidateRequest.dto';
import { CardPrecheckRequestDto } from '../dto/CardPrecheckRequest.dto';

import { ICardBalancesMultipleResponse } from '../interfaces/ICardBalancesMultipleResponse.interface';
import { IMarsApiResponse } from '../interfaces/IMarsApiResponse.interface';
import { IOfferListResponse } from '../interfaces/IOfferListResponse.interface';
import { IStoreLocationsResponse } from '../interfaces/IStoreLocationsResponse.interface';
import { ICardActivateResponse } from '../interfaces/ICardActivateResponse.interface';
import { IRechargeResponse } from '../interfaces/IRechargeResponse.interface';
import { ICardValidateResponse } from '../interfaces/ICardValidateResponse.interface';
import { IRewardsGetCardNumberResponse } from '../interfaces/IRewardsGetCardNumberResponse.interface';
import { IRewardHistory } from '../interfaces/IRewardHistory.interface';
import { PAYMENT_INSTRUMENT_TYPE } from '@open-commerce/data-objects';
import { TestingModule, Test } from '@nestjs/testing';

if (MarsService.isMocked()) {
  describe = describe.skip;
}

describe('MarsService', () => {
  let marsService: MarsService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [MarsCachingModule],
      providers: [MarsService],
      exports: [MarsService],
    }).compile();
    marsService = module.get<MarsService>(MarsService);
  });

  // Create some data to use in tests
  const emailAddress = `stuzo-testing${Math.floor(
    Math.random() * 100000 + 1,
  )}@stuzo.com`;

  let cardNumber = `${Math.floor(Math.random() * 10000000 + 1)}`;

  const paymentInstrumentUuid = `ABC${Math.floor(Math.random() * 100000 + 1)}`;

  it('should be defined', () => {
    expect(marsService).toBeDefined();
  });

  it('should get a token', async () => {
    let gotToken = false;
    try {
      await marsService.refreshToken();
      gotToken = true;
    } catch {
      gotToken = false;
    }
    expect(gotToken).toBe(true);
  });

  // storeLocations
  it('should retrieve store locations', async () => {
    const locations: IStoreLocationsResponse = await marsService.storeLocations();
    expect(locations.locations.length).toBeGreaterThan(0);
  });

  //// cardActivatePhysical
  // it('should activate a physical power card', async () => {
  //  const activatePhysicalCardResult: ICardActivateResponse = await marsService.cardActivatePhysical(
  //    physicalCardDetails,
  //  );
  //  expect(activatePhysicalCardResult.cardNumber).toBe(cardNumber);

  //  // store cardEncoding
  //  cardEncoding = activatePhysicalCardResult.cardEncoding;
  // });

  // cardActivateDigital
  it('should activate a digital power card', async () => {
    const digitalCardDetails = {
      country: 'USA',
      rateCardItemIds: [1],
      dollarsPaid: 12.0,
      storeId: 81,
      paymentInstrumentUuid,
      authorizationCode: 'ABC',
      emailAddress,
    } as CardActivateDigitalRequestDto;

    const activateDigitalCardResult: ICardActivateResponse = await marsService.cardActivateDigital(
      digitalCardDetails,
    );

    // store cardEncoding
    cardNumber = activateDigitalCardResult.cardNumber;

    // CardStatusID is success
    expect(activateDigitalCardResult.cardStatusId).toBe(CARD_STATUS_OPEN);
  });

  // cardValidate
  it('should validate a power card', async () => {
    const powercardForValidateRequest = {
      cardNumber: '26311882',
      pin: 5392,
    } as CardValidateRequestDto;
    const validateCardRequest: ICardValidateResponse = await marsService.cardValidate(
      powercardForValidateRequest,
    );
    expect(validateCardRequest.cardNumber).toBe('26311882');
  });

  // cardPrecheck
  it('should precheck a power card', async () => {
    const powercardForPrecheckRequest = {
      storeId: 81,
      rateCardItemIds: [1],
      dollarsPaid: 12.0,
      paymentInstrumentUuid,
    } as CardPrecheckRequestDto;

    const precheckResult: IMarsApiResponse = await marsService.cardPrecheck(
      powercardForPrecheckRequest,
    );
    expect(precheckResult.success).toBe(true);
  });

  // cardBalancesMultiple
  it('should retrieve power card balances', async () => {
    const powercard = {
      cardNumber,
      country: 'USA',
    } as CardBalanceRequestDto;

    const powercards = {
      cards: [powercard],
    } as CardBalancesMultipleRequestDto;

    const powercardBalances: ICardBalancesMultipleResponse = await marsService.cardBalancesMultiple(
      powercards,
    );
    expect(powercardBalances.balances.length).toBeGreaterThan(0);
  });

  it('should recharge a power card', async () => {
    const powercardForRechargeRequest = {
      storeId: 81,
      cardNumber,
      country: 'USA',
      rateCardItemIds: [1],
      dollarsPaid: 12.0,
      paymentInstrumentUuid,
      paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
      authorizationCode: 'XYZ',
      emailAddress: 'test@email.com',
    } as CardRechargeRequestDto;

    const rechargeCardResult: IRechargeResponse = await marsService.cardRecharge(
      powercardForRechargeRequest,
    );
    expect(rechargeCardResult.tickets).toBe(0);
  });

  it('should throw a MarApiError if a power card is not found', async () => {
    const powercardForRechargeRequestWithIncorrectCardNumber = {
      storeId: 81,
      cardNumber: '867530900000',
      country: 'USA',
      rateCardItemIds: [1],
      dollarsPaid: 12.0,
      paymentInstrumentUuid,
      paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
      authorizationCode: 'XYZ',
      emailAddress: 'test@email.com',
    } as CardRechargeRequestDto;

    let errorToCheck = null;
    try {
      await marsService.cardRecharge(
        powercardForRechargeRequestWithIncorrectCardNumber,
      );
    } catch (error) {
      errorToCheck = error;
    }
    expect(errorToCheck).toBeDefined();
    expect(errorToCheck instanceof MarsApiError).toBe(true);
  });

  // rewardsAddMember
  it('should add a new rewards member account', async () => {
    const customerDetails = {
      emailAddress,
      preferredLocation: 81,
      phoneNumber: '484-885-6446',
      birthDate: '11/29/1969',
      optIn: true,
    } as RewardsAddMemberRequestDto;

    const addMemberResult: IMarsApiResponse = await marsService.rewardsAddMember(
      customerDetails,
    );
    expect(addMemberResult.success).toBe(true);
  });

  // rewardsSetCardNumber
  it('should set the rewards card', async () => {
    const setRewardsCardResult: IMarsApiResponse = await marsService.rewardsSetCardNumber(
      {
        emailAddress,
        cardNumber,
      },
    );
    expect(setRewardsCardResult.success).toBe(true);
  });

  // rewardsGetCardNumber
  it('should get the rewards card associated with a rewards account', async () => {
    const getRewardsCardResult: IRewardsGetCardNumberResponse = await marsService.rewardsGetCardNumber(
      emailAddress,
    );
    expect(getRewardsCardResult.cardNumber).toBe(cardNumber);
  });

  // cardRewardsHistory
  it('should retrieve rewards history', async () => {
    const powercardAndPaginationDetails = {
      cardNumber,
      country: 'USA',
      lastPage: 0,
    } as CardRewardsHistoryRequestDto;

    const rewardsHistory: IRewardHistory = await marsService.cardRewardsHistory(
      powercardAndPaginationDetails,
    );
    expect(rewardsHistory.rewardPoints).toBeGreaterThan(-1);
  });

  // cardDeActivate
  it('should deactivate a power card', async () => {
    const deactivateCardResult: IMarsApiResponse = await marsService.cardDeActivate(
      {
        cardNumber,
        country: 'USA',
      },
    );
    expect(deactivateCardResult.success).toBe(true);
  });

  it('should re-activate a power card', async () => {
    const reactivateCardResult: IMarsApiResponse = await marsService.cardReActivate(
      {
        cardNumber,
        country: 'USA',
      },
    );
    expect(reactivateCardResult.success).toBe(true);
  });

  // offerList
  it('should give a list of offers', async () => {
    const offers: IOfferListResponse = await marsService.offerList({
      storeId: 81,
      emailAddress,
    });
    expect(offers.offers.length).toBeGreaterThan(0);
  });

  // offerRedeem
  it('should redeem an offer', async () => {
    const offerRedeemResult: IMarsApiResponse = await marsService.offerRedeem({
      offerId: 1,
      emailAddress,
    });
    expect(offerRedeemResult.success).toBe(true);
  });

  // rewardsUpdateOptIn
  it('should update rewards email opt in', async () => {
    const updateOptInResult: IMarsApiResponse = await marsService.rewardsUpdateOptIn(
      {
        emailAddress,
        optIn: false,
      },
    );
    expect(updateOptInResult.success).toBe(true);
  });

  // rewardsUpdateMember
  it('should update member details', async () => {
    const updatedCustomerDetails = {
      emailAddress,
      preferredLocation: 81,
      birthDate: '11/29/1969',
      phoneNumber: '484-885-6446',
      firstName: 'Stuzo',
      lastName: 'Tester',
      zipCode: '19108',
      optIn: true,
    } as RewardsUpdateMemberRequestDto;

    const updateMemberResult: IMarsApiResponse = await marsService.rewardsUpdateMember(
      updatedCustomerDetails,
    );
    expect(updateMemberResult.success).toBe(true);
  });

  // rewardsUpdateEmailAddress
  it('should update rewards email address', async () => {
    const newCustomerEmail = `stuzo-testing${Math.floor(
      Math.random() * 100000 + 1,
    )}@stuzo.com`;
    const updateEmailResult: IMarsApiResponse = await marsService.rewardsUpdateEmailAddress(
      {
        oldEmailAddress: emailAddress,
        newEmailAddress: newCustomerEmail,
      },
    );
    expect(updateEmailResult.success).toBe(true);
  });
});
