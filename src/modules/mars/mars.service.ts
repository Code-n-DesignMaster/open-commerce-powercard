import { get, set, last } from 'lodash';
import {
  ENABLE_CONFIG_LOGGING,
  MARS_SERVICE_CONFIG,
} from '../../config/config.constants';
import { IMarsConfig } from '../../config/mars-config.interface';
import { MarsApiError } from './mars-error';
import { MarsCachingService } from '../mars-caching/mars-caching.service';
import { LoggerService } from '@open-commerce/nestjs-logger';

import { ICardBalance } from './interfaces/ICardBalance.interface';
import { ICardBalancesMultipleResponse } from './interfaces/ICardBalancesMultipleResponse.interface';
import { IMarsApiResponse } from './interfaces/IMarsApiResponse.interface';
import { ITokenResponse } from './interfaces/ITokenResponse.interface';
import { IPowercardOfferList } from './interfaces/IPowercardOfferList.interface';
import { IStoreLocationsResponse } from './interfaces/IStoreLocationsResponse.interface';
import { ICardActivateResponse } from './interfaces/ICardActivateResponse.interface';
import { IRechargeResponse } from './interfaces/IRechargeResponse.interface';
import { ICardValidateResponse } from './interfaces/ICardValidateResponse.interface';
import { IRewardsGetCardNumberResponse } from './interfaces/IRewardsGetCardNumberResponse.interface';
import { IRewardHistory } from './interfaces/IRewardHistory.interface';

import { RewardsAddMemberRequestDto } from './dto/RewardsAddMemberRequest.dto';
import { RewardsUpdateMemberRequestDto } from './dto/RewardsUpdateMemberRequest.dto';
import { CardRewardsHistoryRequestDto } from './dto/CardRewardsHistoryRequest.dto';
import { CardBalancesMultipleRequestDto } from './dto/CardBalancesMultipleRequest.dto';
import { CardBalanceRequestDto } from './dto/CardBalanceRequest.dto';
import { CardActivatePhysicalRequestDto } from './dto/CardActivatePhysicalRequest.dto';
import { CardActivateDigitalRequestDto } from './dto/CardActivateDigitalRequest.dto';
import { CardRechargeRequestDto } from './dto/CardRechargeRequest.dto';
import { CardValidateRequestDto } from './dto/CardValidateRequest.dto';
import { CardPrecheckRequestDto } from './dto/CardPrecheckRequest.dto';
import { CardDeactivateRequestDto } from './dto/CardDeactivateRequest.dto';
import { CardReactivateRequestDto } from './dto/CardReactivateRequest.dto';
import { OfferListRequestDto } from './dto/OfferListRequest.dto';
import { RewardsUpdateOptInRequestDto } from './dto/RewardsUpdateOptInRequest.dto';
import { RewardsSetCardNumberRequestDto } from './dto/RewardsSetCardNumberRequest.dto';
import { RewardsUpdateEmailAddressRequestDto } from './dto/RewardsUpdateEmailAddressRequest.dto';
import { OfferRedeemRequestDto } from './dto/OfferRedeemRequest.dto';
import { PowercardBalanceUpdateDto } from './dto/powercard-balance-update.dto';

import { CardActivateDigitalSerializer } from './serializers/card-activate-digitial.serializer';
import { CardActivatePhysicalSerializer } from './serializers/card-activate-physical.serializer';
import { OfferRedeemSerializer } from './serializers/offer-redeem.serializer';
import { RewardsAddMemberSerializer } from './serializers/rewards-add-member.serializer';
import { RewardsUpdateMemberSerializer } from './serializers/rewards-update-member.serializer';
import { RewardsUpdateOptInSerializer } from './serializers/rewards-update-opt-in.serializer';
import { RewardsUpdateEmailAddressSerializer } from './serializers/rewards-update-email-address.serializer';
import { CardDeactivateSerializer } from './serializers/card-deactivate.serializer';
import { CardReactivateSerializer } from './serializers/card-reactivate.serializer';
import { CardPrecheckSerializer } from './serializers/card-precheck.serializer';
import { RewardsSetCardNumberSerializer } from './serializers/rewards-set-card-number.serializer';
import { CardRewardsHistorySerializer } from './serializers/card-rewards-history.serializer';
import { CardRechargeSerializer } from './serializers/card-recharge.serializer';
import { CardBalancesSerializer } from './serializers/card-balances.serializer';
import { LocationsSerializer } from './serializers/locations.serializer';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { RateCardSerializer } from './serializers/rate-card.serializer';
import { RateCardRequestDto } from './dto/RateCardRequest.dto';
import { CardValidateSerializer } from './serializers/card-validate.serializer';
import { OfferListSerializer } from './serializers/offer-list.serializer';
import { IRateCard } from '@open-commerce/data-objects';

import { CardBalanceMapper } from './card-balance.mapper';
import { MarsRequest } from './mars-request';
import { CheckListSerializer } from './serializers/check-list.serializer';
import { ICheckListResponse } from './interfaces/ICheckListResponse.interface';
import { CheckDetailSerializer } from './serializers/check-detail.serializer';
import { ICheckDetailResponse } from './interfaces/ICheckDetailResponse.interface';
import { ApplyPaymentSerializer } from './serializers/apply-payment.serializer';
import { IApplyPaymentResponse } from './interfaces/IApplyPaymentResponse.interface';
import { ApplyPaymentRequestDto } from './dto/ApplyPaymentRequest.dto';

@Injectable()
export class MarsService implements OnApplicationBootstrap {
  // TODO: this can't be static and get data from config but we might need to live with it since it's only used for testing
  public static isMocked() {
    return process.env.ENABLE_MARS_MOCK === 'true';
  }

  private readonly loggerContext = this.constructor.name;

  private accessToken: string = null;
  private refreshTokenTimer: any = null;

  private cardActivateDigitalSerializer: CardActivateDigitalSerializer;
  private cardActivatePhysicalSerializer: CardActivatePhysicalSerializer;
  private offerRedeemSerializer: OfferRedeemSerializer;
  private rewardsAddMemberSerializer: RewardsAddMemberSerializer;
  private rewardsUpdateMemberSerializer: RewardsUpdateMemberSerializer;
  private rewardsUpdateOptInSerializer: RewardsUpdateOptInSerializer;
  private rewardsUpdateEmailAddressSerializer: RewardsUpdateEmailAddressSerializer;
  private cardDeactivateSerializer: CardDeactivateSerializer;
  private cardReactivateSerializer: CardReactivateSerializer;
  private cardPrecheckSerializer: CardPrecheckSerializer;
  private rewardsSetCardNumberSerializer: RewardsSetCardNumberSerializer;
  private cardRewardsHistorySerializer: CardRewardsHistorySerializer;
  private cardRechargeSerializer: CardRechargeSerializer;
  private cardBalancesSerializer: CardBalancesSerializer;
  private locationsSerializer: LocationsSerializer;
  private rateCardSerializer: RateCardSerializer;
  private cardValidateSerializer: CardValidateSerializer;
  private offerListSerializer: OfferListSerializer;
  private checkListSerializer: CheckListSerializer;
  private checkDetailSerializer: CheckDetailSerializer;
  private applyPaymentSerializer: ApplyPaymentSerializer;

  private marsRequest: MarsRequest;

  public constructor(
    private logger: LoggerService,
    private marsCachingService: MarsCachingService,
    @Inject(MARS_SERVICE_CONFIG)
    private readonly marsConfig: IMarsConfig,
    @Inject(ENABLE_CONFIG_LOGGING)
    enableConfigLogging: boolean,
  ) {
    if (
      this.marsConfig.apiUrl === null ||
      this.marsConfig.clientKey === null ||
      this.marsConfig.clientSecret === null
    ) {
      throw new Error(`You must specify MARS_API_URL, `);
    }
    this.initSerializers();
    this.marsRequest = new MarsRequest(logger, this.marsConfig);
    if (enableConfigLogging) {
      this.logger.debug(
        `Mars Service Configuration:\n${JSON.stringify(
          this.marsConfig,
          null,
          4,
        )}`,
        this.loggerContext,
      );
    }
  }

  public initSerializers() {
    this.cardActivateDigitalSerializer = new CardActivateDigitalSerializer(
      this.marsConfig.enableLogging,
    );
    this.cardActivatePhysicalSerializer = new CardActivatePhysicalSerializer(
      this.marsConfig.enableLogging,
    );
    this.offerRedeemSerializer = new OfferRedeemSerializer(
      this.marsConfig.enableLogging,
    );
    this.rewardsAddMemberSerializer = new RewardsAddMemberSerializer(
      this.marsConfig.enableLogging,
    );
    this.rewardsUpdateMemberSerializer = new RewardsUpdateMemberSerializer(
      this.marsConfig.enableLogging,
    );
    this.rewardsUpdateOptInSerializer = new RewardsUpdateOptInSerializer(
      this.marsConfig.enableLogging,
    );
    this.rewardsUpdateEmailAddressSerializer = new RewardsUpdateEmailAddressSerializer(
      this.marsConfig.enableLogging,
    );
    this.cardDeactivateSerializer = new CardDeactivateSerializer(
      this.marsConfig.enableLogging,
    );
    this.cardReactivateSerializer = new CardReactivateSerializer(
      this.marsConfig.enableLogging,
    );
    this.cardPrecheckSerializer = new CardPrecheckSerializer(
      this.marsConfig.enableLogging,
    );
    this.rewardsSetCardNumberSerializer = new RewardsSetCardNumberSerializer(
      this.marsConfig.enableLogging,
    );
    this.cardRewardsHistorySerializer = new CardRewardsHistorySerializer(
      this.marsConfig.enableLogging,
    );
    this.cardRechargeSerializer = new CardRechargeSerializer(
      this.marsConfig.enableLogging,
    );
    this.cardBalancesSerializer = new CardBalancesSerializer(
      this.marsConfig.enableLogging,
    );
    this.locationsSerializer = new LocationsSerializer(
      this.marsConfig.enableLogging,
    );
    this.rateCardSerializer = new RateCardSerializer(
      this.marsConfig.enableLogging,
    );
    this.cardValidateSerializer = new CardValidateSerializer(
      this.marsConfig.enableLogging,
    );
    this.offerListSerializer = new OfferListSerializer(
      this.marsConfig.enableLogging,
    );
    this.checkListSerializer = new CheckListSerializer(
      this.marsConfig.enableLogging,
    );
    this.checkDetailSerializer = new CheckDetailSerializer(
      this.marsConfig.enableLogging,
    );
    this.applyPaymentSerializer = new ApplyPaymentSerializer(
      this.marsConfig.enableLogging,
    );
  }

  public async onApplicationBootstrap(): Promise<any> {
    this.logger.debug(
      'running actions for onApplicationBootstrap',
      this.loggerContext,
    );

    if (this.marsConfig.enableMock) {
      this.logger.debug(
        'mars is mocked; skipping refresh token triggering',
        this.loggerContext,
      );
    } else {
      this.logger.debug(
        'mars is not mocked; triggering token refresh',
        this.loggerContext,
      );
      await this.refreshToken();
    }
  }

  // =============================================================
  // MARS - OFFERS
  // =============================================================

  // MARS - /OfferList
  public async offerList(
    offerListRequestDto: OfferListRequestDto,
  ): Promise<IPowercardOfferList> {
    const url = this.marsConfig.apiUrl + 'OfferList';
    const serializer = this.offerListSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'get',
        url,
        data: {
          ...serializer.serialize(offerListRequestDto),
        },
        headers: this.createRequestHeader(),
      });

      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /PayAnywhereCheckList
  public async checkList(
    tableUuid: string,
    refreshCache: boolean = false,
  ): Promise<ICheckListResponse> {
    const url = this.marsConfig.apiUrl + 'PayAnywhereCheckList';

    const serializer = this.checkListSerializer;

    if (!refreshCache) {
      // Check if it's in the cache
      const checkListCache = await this.marsCachingService.getTableUpdateInCache(
        tableUuid,
      );

      if (checkListCache) {
        this.logger.debug(
          `Returning table update for ${tableUuid} from cache.`,
          this.loggerContext,
        );

        this.logger.debug(
          `Pulled this table update for ${tableUuid} from cache: ${JSON.stringify(
            checkListCache,
          )}`,
          this.loggerContext,
        );

        return JSON.parse(JSON.stringify(checkListCache));
      }
    }

    try {
      const response = await this.marsRequest.makeRequest({
        // method: 'post',
        method: 'get',
        url,
        data: {
          ...serializer.serialize(tableUuid),
        },
        headers: this.createRequestHeader(),
      });

      const deserializedCheckListUpdate = serializer.deserialize(response);

      // Store it in the cache
      await this.marsCachingService.storeTableUpdateInCache(
        tableUuid,
        JSON.parse(JSON.stringify(deserializedCheckListUpdate)),
      );

      return deserializedCheckListUpdate;
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /PayAnywhereCheckDetail
  public async checkDetail(
    storeId: number,
    payCode: string,
    refreshCache: boolean = false,
  ): Promise<ICheckDetailResponse> {
    const url = this.marsConfig.apiUrl + 'PayAnywhereCheckDetail';
    const serializer = this.checkDetailSerializer;

    if (!refreshCache) {
      // Check if it's in the cache
      const checkDetailCache = await this.marsCachingService.getCheckUpdateInCache(
        storeId,
        payCode,
      );

      if (checkDetailCache) {
        this.logger.debug(
          `Returning check update for ${storeId}-${payCode} from cache.`,
          this.loggerContext,
        );

        this.logger.debug(
          `Pulled this check update for ${storeId}-${payCode} from cache: ${JSON.stringify(
            checkDetailCache,
          )}`,
          this.loggerContext,
        );

        return JSON.parse(JSON.stringify(checkDetailCache));
      }
    }

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'get',
        url,
        data: {
          ...serializer.serialize({ storeId, payCode }),
        },
        headers: this.createRequestHeader(),
      });

      const deserializedCheckUpdate = serializer.deserialize(response);

      // Store it in the cache
      await this.marsCachingService.storeCheckUpdateInCache(
        storeId,
        payCode,
        JSON.parse(JSON.stringify(deserializedCheckUpdate)),
      );

      return deserializedCheckUpdate;
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /PayAnywhereApplyPayment
  public async applyPayment(
    input: ApplyPaymentRequestDto,
  ): Promise<IApplyPaymentResponse> {
    const url = this.marsConfig.apiUrl + 'PayAnywhereApplyPayment';
    const serializer = this.applyPaymentSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(input),
        },
        headers: this.createRequestHeader(),
      });

      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /OfferRedeem
  public async offerRedeem(
    input: OfferRedeemRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'OfferRedeem';
    const serializer = this.offerRedeemSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(input),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // =============================================================
  // MARS - REWARDS
  // =============================================================

  // MARS - /RewardsAddMember
  public async rewardsAddMember(
    customerDetails: RewardsAddMemberRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'RewardsAddMember';
    const serializer = this.rewardsAddMemberSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(customerDetails),
        },
        headers: this.createRequestHeader(),
      });

      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /RewardsGetCardNumber
  public async rewardsGetCardNumber(
    emailAddress: string,
  ): Promise<IRewardsGetCardNumberResponse> {
    const url = this.marsConfig.apiUrl + 'RewardsGetCardNumber';

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'get',
        url: url + `?EmailAddress=${emailAddress}`,
        headers: this.createRequestHeader(),
      });
      return {
        cardNumber: `${get(response, 'data.CardNumber')}`,
      };
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /RewardsSetCardNumber
  public async rewardsSetCardNumber(
    input: RewardsSetCardNumberRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'RewardsSetCardNumber';
    const serializer = this.rewardsSetCardNumberSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(input),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /RewardsUpdateEmailAddress
  public async rewardsUpdateEmailAddress(
    input: RewardsUpdateEmailAddressRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'RewardsUpdateEmailAddress';
    const serializer = this.rewardsUpdateEmailAddressSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(input),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /RewardsUpdateMember
  public async rewardsUpdateMember(
    updatedCustomerDetails: RewardsUpdateMemberRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'RewardsUpdateMember';
    const serializer = this.rewardsUpdateMemberSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(updatedCustomerDetails),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }
  // MARS - /CardRewardsHistory
  public async cardRewardsHistory(
    powercardAndPaginationDetails: CardRewardsHistoryRequestDto,
  ): Promise<IRewardHistory> {
    const url = this.marsConfig.apiUrl + 'CardRewardsHistory';
    const serializer = this.cardRewardsHistorySerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'get',
        url,
        data: {
          ...serializer.serialize(powercardAndPaginationDetails),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /RewardsUpdateEmailOptIn
  public async rewardsUpdateOptIn(
    input: RewardsUpdateOptInRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'RewardsUpdateEmailOptIn';
    const serializer = this.rewardsUpdateOptInSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(input),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // =============================================================
  // MARS - RATE CARDS
  // =============================================================

  // MARS - /RateCards
  public async rateCards(input: RateCardRequestDto): Promise<IRateCard> {
    const url = this.marsConfig.apiUrl + 'RateCards';
    const serializer = this.rateCardSerializer;

    // Check if rate card is the cache
    const rateCardCache = await this.marsCachingService.getRateCardInCache(
      input.storeId,
      input.isNewCustomer,
      input.paymentType,
      input.version,
    );

    if (rateCardCache) {
      this.logger.debug(
        `Returning rate card version ${input.version} with isNewCustomer = ${input.isNewCustomer} from cache.`,
        this.loggerContext,
      );

      return serializer.deserialize({
        data: rateCardCache,
      });
    }

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'get',
        url,
        data: {
          ...serializer.serialize(input),
        },
        headers: this.createRequestHeader(),
      });

      // Store rate card in cache
      await this.marsCachingService.storeRateCardInCache(
        response.data,
        input.storeId,
        input.isNewCustomer,
        input.paymentType,
        input.version,
      );

      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // =============================================================
  // MARS - LOCATIONS
  // =============================================================

  // MARS - /StoreLocations
  public async storeLocations(
    refreshCache = false,
  ): Promise<IStoreLocationsResponse> {
    const url = this.marsConfig.apiUrl + 'StoreLocations';
    const serializer = this.locationsSerializer;

    // Check if locations are in the cache
    const locationsCache = await this.marsCachingService.getLocationsInCache();

    if (locationsCache && !refreshCache) {
      this.logger.debug('Returning locations from cache.', this.loggerContext);
      return serializer.deserialize({
        data: locationsCache,
      });
    }

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'get',
        url,
        headers: {
          Accept: 'application/json',
          Authorization: 'Bearer ' + this.accessToken,
        },
      });

      if (this.marsConfig.locationsFilter) {
        response.data.StoreList = response.data.StoreList.filter(location =>
          this.marsConfig.locationsFilter.includes(location.StoreNumber),
        );
      }

      // Store locations in cache
      await this.marsCachingService.storeLocationsInCache(response.data);

      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // =============================================================
  // MARS - POWER CARDS
  // =============================================================

  // MARS - /CardActivate
  public async cardActivatePhysical(
    cardDetails: CardActivatePhysicalRequestDto,
  ): Promise<ICardActivateResponse> {
    const url = this.marsConfig.apiUrl + 'CardActivate';
    const serializer = this.cardActivatePhysicalSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(cardDetails),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /CardActivateDigital
  public async cardActivateDigital(
    cardDetails: CardActivateDigitalRequestDto,
  ): Promise<ICardActivateResponse> {
    const url = this.marsConfig.apiUrl + 'CardActivateDigital';
    const serializer = this.cardActivateDigitalSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(cardDetails),
        },
        headers: this.createRequestHeader(),
        timeout: this.marsConfig.transactionTimeoutMs,
      });
      await this.updatePowercardBalancesInCache(
        CardBalanceMapper.mapCardBalancesFromMarsResponse(response),
      );

      // Clear the offers cache
      // await this.marsCachingService.removeOffersInCache(
      //   cardDetails.storeId,
      //   cardDetails.emailAddress,
      // );

      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /CardDeActivate
  public async cardDeActivate(
    cardDetails: CardDeactivateRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'CardDeActivate';
    const serializer = this.cardDeactivateSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(cardDetails),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /CardReActivate
  public async cardReActivate(
    cardDetails: CardReactivateRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'CardReActivate';
    const serializer = this.cardReactivateSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(cardDetails),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /CardPreCheck
  public async cardPrecheck(
    powercardForPrecheckRequest: CardPrecheckRequestDto,
  ): Promise<IMarsApiResponse> {
    const url = this.marsConfig.apiUrl + 'CardPreCheck';
    const serializer = this.cardPrecheckSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'get',
        url,
        data: {
          ...serializer.serialize(powercardForPrecheckRequest),
        },
        headers: this.createRequestHeader(),
      });
      return serializer.deserialize(response);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  public async updatePowercardBalancesInCache(
    powercardBalanceUpdate: PowercardBalanceUpdateDto,
  ) {
    if (!powercardBalanceUpdate.cardNumber) {
      return;
    }

    // Get existing balances in cache
    let powercardBalances = await this.marsCachingService.getBalancesInCacheForPowercard(
      powercardBalanceUpdate.cardNumber,
    );

    // Create an empty object if doesn't exist
    if (powercardBalances === null) {
      powercardBalances = {
        StoreID: null,
        IsRegistered: false,
        CardNumber: null,
        Country: null,
        Status: null,
        GameChips: null,
        VideoChips: null,
        RewardChips: null,
        AttractionChips: null,
        Tickets: null,
        PointsToNextReward: null,
        EligibleRewardCount: null,
        CardEncoding: null,
      };
    }

    // Update with the latest balances
    set(powercardBalances, 'CardNumber', powercardBalanceUpdate.cardNumber);
    set(powercardBalances, 'GameChips', powercardBalanceUpdate.gameChips);
    set(powercardBalances, 'VideoChips', powercardBalanceUpdate.videoChips);
    set(powercardBalances, 'RewardChips', powercardBalanceUpdate.rewardChips);
    set(powercardBalances, 'StoreID', powercardBalanceUpdate.storeId);
    set(
      powercardBalances,
      'AttractionChips',
      powercardBalanceUpdate.attractionChips,
    );
    set(powercardBalances, 'Tickets', powercardBalanceUpdate.tickets);
    set(powercardBalances, 'RewardPoints', powercardBalanceUpdate.rewardPoints);
    set(
      powercardBalances,
      'PointsToNextReward',
      powercardBalanceUpdate.pointsToNextReward,
    );
    set(
      powercardBalances,
      'EligibleRewardCount',
      powercardBalanceUpdate.eligibleRewardCount,
    );
    set(powercardBalances, 'CardEncoding', powercardBalanceUpdate.cardEncoding);

    // Store in cache
    await this.marsCachingService.storePowercardBalancesInCache(
      powercardBalances.CardNumber,
      JSON.parse(JSON.stringify(powercardBalances)),
    );
  }

  // MARS - /CardRecharge
  public async cardRecharge(
    rechargeDetails: CardRechargeRequestDto,
  ): Promise<IRechargeResponse> {
    const url = this.marsConfig.apiUrl + 'CardRecharge';
    const serializer = this.cardRechargeSerializer;

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: {
          ...serializer.serialize(rechargeDetails),
        },
        headers: this.createRequestHeader(),
        timeout: this.marsConfig.transactionTimeoutMs,
      });

      const rechargeResponse = serializer.deserialize(response);
      const powercardBalanceUpdate = CardBalanceMapper.mapCardBalancesFromMarsResponse(
        response,
        rechargeDetails.cardNumber,
      );

      // only update if we have valid data
      if (powercardBalanceUpdate) {
        // Add in the current power card number because it's not in the response
        powercardBalanceUpdate.cardNumber = parseInt(
          rechargeDetails.cardNumber,
          10,
        );
        await this.updatePowercardBalancesInCache(powercardBalanceUpdate);
      }

      // Clear the offers cache
      // await this.marsCachingService.removeOffersInCache(
      //   rechargeDetails.storeId,
      //   rechargeDetails.emailAddress,
      // );

      // NOTE: this is a workaround intended to improve the response of reward point
      // balance updates now that they are being processed asynchronously and we can
      // no longer use the value that comes back in the recharge response.
      await this.marsCachingService.invalidatePowercardBalancesInCache(
        +rechargeDetails.cardNumber,
      );
      setTimeout(
        (async (cardNumber: string, country: string) => {
          await this.cardBalance({
            cardNumber,
            country,
          });
        }).bind(this),
        this.marsConfig.rechargeBalanceRefreshTimeoutMs,
        rechargeDetails.cardNumber,
        rechargeDetails.country,
      );

      return rechargeResponse;
    } catch (error) {
      this.logger.error('error', error, this.loggerContext);
      throw this.checkResponseAndBuildError(error);
    }
  }

  // MARS - /CardValidate
  public async cardValidate(
    powercardForValidateRequest: CardValidateRequestDto,
  ): Promise<ICardValidateResponse> {
    const url = this.marsConfig.apiUrl + 'CardValidate';
    const serializer = this.cardValidateSerializer;

    const data = {
      ...serializer.serialize(powercardForValidateRequest),
    };

    let response;

    this.logger.debug(
      `sending card validate request to MARS\n${url}\n${data}`,
      this.loggerContext,
    );

    try {
      response = await this.marsRequest.makeRequest({
        method: 'get',
        url,
        data,
        headers: this.createRequestHeader(),
      });
    } catch (error) {
      // TODO: handle 400s here
      throw this.checkResponseAndBuildError(error);
    }

    return serializer.deserialize(response);
  }

  // NOTE: This is a convenience method so that you don't have to create an extra object just to grab a single card balance.
  // It just wraps cardBalancesMultiple
  public async cardBalance(
    powerCard: CardBalanceRequestDto,
  ): Promise<ICardBalance> {
    const powerCardBalancesRequest = new CardBalancesMultipleRequestDto();
    powerCardBalancesRequest.cards = [powerCard];

    const powerCardBalances = await this.cardBalancesMultiple(
      powerCardBalancesRequest,
    );

    if (
      powerCardBalances &&
      powerCardBalances.balances &&
      powerCardBalances.balances.length > 0
    ) {
      return powerCardBalances.balances[0];
    } else {
      return null;
    }
  }

  // MARS - /CardBalancesMultiple
  // NOTE: This request does NOT use the default axios timeout because of how long this call can take (up to 60 sec).
  // Instead it uses cardBalanceCheckTimoutMs.
  public async cardBalancesMultiple(
    powercards: CardBalancesMultipleRequestDto,
  ): Promise<ICardBalancesMultipleResponse> {
    const url = this.marsConfig.apiUrl + 'CardBalancesMultiple';
    const serializer = this.cardBalancesSerializer;

    const powercardBalances = [];
    const needToFetchPowercards = [];

    // Figure out which balances are in the cache
    for (const powercard of powercards.cards) {
      const cachedPowercardBalances = await this.marsCachingService.getBalancesInCacheForPowercard(
        +powercard.cardNumber,
      );
      if (cachedPowercardBalances) {
        this.logger.debug(
          `Got balances for powercard ${powercard.cardNumber} from cache`,
          this.loggerContext,
        );
        powercardBalances.push(cachedPowercardBalances);
      } else {
        needToFetchPowercards.push(powercard);
      }
    }

    // Update request to remove cards we don't need to look up in mars
    const updatedPowercardsRequest = new CardBalancesMultipleRequestDto();
    updatedPowercardsRequest.cards = [];

    for (const needToFetchPowercard of needToFetchPowercards) {
      updatedPowercardsRequest.cards.push(needToFetchPowercard);
    }

    // Only look up the cards, if any, we need to
    if (needToFetchPowercards.length > 0) {
      try {
        const response = await this.marsRequest.makeRequest({
          method: 'get',
          url,
          data: {
            ...serializer.serialize(updatedPowercardsRequest),
          },
          timeout: this.marsConfig.cardBalanceCheckTimoutMs,
          headers: this.createRequestHeader(),
        });

        const cardBalancesResponses = get(response, 'data.CardBalanceList');
        if (cardBalancesResponses) {
          for (const cardBalanceResponse of cardBalancesResponses) {
            const cardNumber = get(cardBalanceResponse, 'CardNumber');
            const status = get(cardBalanceResponse, 'Status');

            if (cardNumber) {
              powercardBalances.push(cardBalanceResponse);

              // Only cache if the status is 200 = card found
              if (status === 200) {
                await this.marsCachingService.storePowercardBalancesInCache(
                  cardNumber,
                  cardBalanceResponse,
                );
              }
            }
          }
        }
      } catch (error) {
        throw this.checkResponseAndBuildError(error);
      }
    }

    return serializer.deserialize({
      data: {
        CardBalanceList: powercardBalances,
      },
    });
  }

  // =============================================================
  // MARS - SESSION TOKEN
  // =============================================================

  // MARS - /auth/request_token
  public async requestToken(): Promise<ITokenResponse> {
    const url = this.marsConfig.apiUrl + 'auth/request_token';
    const formData = {
      scope: 'system_read system_write',
      grant_type: 'client_credentials',
      'content-type': 'application/x-www-form-urlencoded',
    };

    try {
      const response = await this.marsRequest.makeRequest({
        method: 'post',
        url,
        data: this.encodeData(formData),
        headers: this.createRequestHeader(),
        auth: {
          username: this.marsConfig.clientKey,
          password: this.marsConfig.clientSecret,
        },
      });
      return response.data;
    } catch (error) {
      const errorData = get(error, 'response.data');
      let errorText = `DaveBustersService::MarsAPI::requestToken - something went wrong while fetching the access_token from MARS: ${error}`;
      if (errorData) {
        errorText += `{JSON.stringify(errorData)}`;
      }
      throw this.checkResponseAndBuildError(new Error(errorText));
    }
  }

  public async refreshToken(): Promise<void> {
    this.logger.debug('refreshing token', this.loggerContext);

    // Clear the refresh timer if it exists. Make sure there's only one.
    if (this.refreshTokenTimer) {
      clearTimeout(this.refreshTokenTimer);
    }

    try {
      const response = await this.requestToken();
      const token = response.access_token;

      if (!token) {
        // Refresh token in 5 seconds
        this.refreshTokenTimer = setTimeout(async (): Promise<void> => {
          await this.refreshToken();
        }, 1000 * 5);

        throw this.checkResponseAndBuildError(
          new Error('Auth failed, token is null'),
        );
      }
      this.accessToken = response.access_token;

      // Refresh token after marsTokenTimeoutInMinutes minutes
      this.refreshTokenTimer = setTimeout(async (): Promise<void> => {
        await this.refreshToken();
      }, this.marsConfig.tokenTimeoutInMinutes * 1000 * 60);
    } catch (error) {
      throw this.checkResponseAndBuildError(error);
    }
  }

  // HELPERS
  private checkResponseAndBuildError(error: any): MarsApiError {
    if (error instanceof MarsApiError) {
      return error;
    }

    const url = get(error, 'response.config.url', '/');
    const path: string = last(url.split('/'));

    // handle timeout
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      const message = 'The request to MARS timed out';
      const status = 408;
      return new MarsApiError({
        url,
        timedOut: true,
        marsErrorMessage: message,
        marsResponseStatus: status,
      });
    }

    const status = get(error, 'response.status');

    if (status === 401) {
      // tslint:disable-next-line: no-floating-promises
      this.refreshToken();
    }

    // Next build the error
    let errorMessage = get(error, 'response.data.error');

    // We could also get another type of error
    if (!errorMessage) {
      errorMessage = get(error, 'response.data.Message');
    }

    // Worst case we'll report on the expired MARS auth token
    if (!errorMessage && status === 401) {
      errorMessage = 'MARS Auth Token Has Expired!';
    }

    if (errorMessage) {
      this.logger.debug(
        `${this.marsRequest.getMarsEndpointFromUrl(
          url,
        )} FAILED with error: ${status} - ${errorMessage}`,
        this.loggerContext,
      );
    } else {
      this.logger.debug(
        `${this.marsRequest.getMarsEndpointFromUrl(
          url,
        )} FAILED with raw response: ${status} - ${get(
          error,
          'response.data',
        )}`,
        this.loggerContext,
      );
    }

    const responseError = new MarsApiError({
      url: path,
      marsResponseStatus: status,
      marsErrorMessage: errorMessage,
    });

    return responseError;
  }

  // TODO: put this in a lib somewhere
  private encodeData(data: object) {
    return Object.keys(data)
      .map(key => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  }

  private createRequestHeader() {
    return {
      Accept: 'application/json',
      Authorization: 'Bearer ' + this.accessToken,
    };
  }
}
