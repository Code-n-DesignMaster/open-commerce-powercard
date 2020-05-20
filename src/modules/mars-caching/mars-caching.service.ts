import { get } from 'lodash';
import { Inject, Injectable } from '@nestjs/common';
import { RedisService } from '@open-commerce/nestjs-redis';
import { LoggerService } from '@open-commerce/nestjs-logger';
import {
  ENABLE_CONFIG_LOGGING,
  MARS_CACHING_SERVICE_CONFIG,
  PAY_ANYWHERE_CONFIG,
} from '../../config/config.constants';
import { IMarsCachingConfig } from '../../config/mars-caching-config.interface';
import { IPowercardBalances } from '../powercard-balances/powercard-balances.interface';
import { POWERCARD_TRANSACTION_STATE } from '../powercard/powercard-transaction-state.enum';
import { IPayAnywhereConfig } from '../../config/pay-anywhere-config.interface';

@Injectable()
export class MarsCachingService {
  private readonly loggerContext = this.constructor.name;

  constructor(
    private logger: LoggerService,
    private redisClient: RedisService,
    @Inject(MARS_CACHING_SERVICE_CONFIG)
    private readonly marsCachingConfig: IMarsCachingConfig,
    @Inject(PAY_ANYWHERE_CONFIG)
    private readonly payAnywhereConfig: IPayAnywhereConfig,
    @Inject(ENABLE_CONFIG_LOGGING)
    enableConfigLogging: boolean,
  ) {
    if (enableConfigLogging) {
      this.logger.debug(
        `Mars Caching Service Configuration:\n${JSON.stringify(
          this.marsCachingConfig,
          null,
          4,
        )}`,
        this.loggerContext,
      );
    }
  }

  public async invalidatePowercardBalancesInCache(powercardNumber: number) {
    await this.redisClient.deleteKey(
      this.buildPowercardBalanceKey(powercardNumber.toString()),
    );
  }

  public async markPowercardValidStatusInCache(
    cardNumber: string,
    valid: boolean,
  ) {
    if (cardNumber) {
      return await this.redisClient.storeByKeyWithExpiration(
        this.buildPowercardNumberValidKey(cardNumber),
        valid.toString(),
        this.marsCachingConfig.powercardValidExpirationSeconds,
      );
    } else {
      this.logger.debug(
        `cardNumber was null. Can't mark status in redis.`,
        this.loggerContext,
      );
    }
  }

  public async getPowercardValidStatusFromCache(
    cardNumber: string,
  ): Promise<boolean> {
    const powercardValidStatus = await this.redisClient.getByKey(
      this.buildPowercardNumberValidKey(cardNumber),
    );
    if (powercardValidStatus === null) {
      return null;
    } else {
      return powercardValidStatus === 'true';
    }
  }

  // NOTE: this will replace the existing data with as much new balance data that's provided
  public async storePowercardBalancesInCache(
    powercardNumber: number,
    balancesData: JSON,
  ): Promise<boolean> {
    // Merge attributes into existing cache if exists
    const cachedBalanceData = await this.getBalancesInCacheForPowercard(
      powercardNumber,
    );

    const mergedBalanceData = {
      CardNumber: powercardNumber,
      Tickets: this.mergeAttribute(balancesData, cachedBalanceData, 'Tickets'),
      GameChips: this.mergeAttribute(
        balancesData,
        cachedBalanceData,
        'GameChips',
      ),
      StoreID: this.mergeAttribute(balancesData, cachedBalanceData, 'StoreID'),
      Country: this.mergeAttribute(balancesData, cachedBalanceData, 'Country'),
      IsRegistered: this.mergeAttribute(
        balancesData,
        cachedBalanceData,
        'IsRegistered',
      ),
      Status: this.mergeAttribute(balancesData, cachedBalanceData, 'Status'),
      AttractionChips: this.mergeAttribute(
        balancesData,
        cachedBalanceData,
        'AttractionChips',
      ),
      RewardChips: this.mergeAttribute(
        balancesData,
        cachedBalanceData,
        'RewardChips',
      ),
      PointsToNextReward: this.mergeAttribute(
        balancesData,
        cachedBalanceData,
        'PointsToNextReward',
      ),
      VideoChips: this.mergeAttribute(
        balancesData,
        cachedBalanceData,
        'VideoChips',
      ),
      CardEncoding: this.mergeAttribute(
        balancesData,
        cachedBalanceData,
        'CardEncoding',
      ),
    };

    // Store balances in Redis with expiration
    return await this.redisClient.storeByKeyWithExpiration(
      this.buildPowercardBalanceKey(powercardNumber.toString()),
      JSON.stringify(mergedBalanceData),
      this.marsCachingConfig.powercardBalanceExpirationSeconds,
    );
  }

  public mergeAttribute(
    updatedObject: any,
    originalObject: any,
    attributeName: string,
  ): any {
    return get(
      updatedObject,
      attributeName,
      get(originalObject, attributeName),
    );
  }

  public async getBalancesInCacheForPowercard(
    powercardNumber: number,
  ): Promise<IPowercardBalances> {
    if (!powercardNumber) {
      return null;
    }

    const powercardBalancesString = await this.redisClient.getByKey(
      this.buildPowercardBalanceKey(powercardNumber.toString()),
    );
    if (powercardBalancesString) {
      return JSON.parse(powercardBalancesString);
    } else {
      return null;
    }
  }

  public async storeLocationsInCache(locations: JSON): Promise<boolean> {
    return await this.storeRawMarsMessageInCache(
      this.buildLocationsKey(),
      locations,
      this.marsCachingConfig.locationsExpirationSeconds,
    );
  }

  public async getLocationsInCache(): Promise<JSON> {
    return await this.getRawMarsMessageInCache(this.buildLocationsKey());
  }

  public async storeRateCardInCache(
    rateCard: JSON,
    storeId: number,
    isNewUser: boolean,
    paymentType: number,
    version?: number,
  ) {
    if (!version) {
      version = -1;
    }

    if (isNewUser) {
      return await this.storeRawMarsMessageInCache(
        this.buildRateCardForNewUserKey(version, storeId, paymentType),
        rateCard,
        this.marsCachingConfig.rateCardExpirationSeconds,
      );
    } else {
      return await this.storeRawMarsMessageInCache(
        this.buildRateCardForExistingUserKey(version, storeId, paymentType),
        rateCard,
        this.marsCachingConfig.rateCardExpirationSeconds,
      );
    }
  }

  public async getRateCardInCache(
    storeId: number,
    isNewUser: boolean,
    paymentType: number,
    version?: number,
  ): Promise<JSON> {
    if (!version) {
      version = -1;
    }

    if (isNewUser) {
      return await this.getRawMarsMessageInCache(
        this.buildRateCardForNewUserKey(version, storeId, paymentType),
      );
    } else {
      return await this.getRawMarsMessageInCache(
        this.buildRateCardForExistingUserKey(version, storeId, paymentType),
      );
    }
  }

  public async storeRawMarsMessageInCache(
    key: string,
    message: JSON,
    expirationSeconds: number,
  ): Promise<boolean> {
    return await this.redisClient.storeByKeyWithExpiration(
      key,
      JSON.stringify(message),
      expirationSeconds,
    );
  }

  public async getRawMarsMessageInCache(key: string) {
    const messageString = await this.redisClient.getByKey(key);
    if (messageString) {
      return JSON.parse(messageString);
    } else {
      return null;
    }
  }

  public async storePowercardUuidLookupInCache(
    cardNumber: string,
    uuid: string,
  ): Promise<boolean> {
    return await this.redisClient.addToSet(
      this.buildPowercardUuidLookupKey(cardNumber),
      uuid,
    );
  }

  public async getPowercardUuidsFromPowercardNumberInCache(
    cardNumber: string,
  ): Promise<string[]> {
    return await this.redisClient.getSet(
      this.buildPowercardUuidLookupKey(cardNumber),
    );
  }

  public async storePowercardNumberLookupInCache(
    uuid: string,
    cardNumber: string,
  ): Promise<boolean> {
    return await this.redisClient.storeByKey(
      this.buildPowercardNumberLookupKey(uuid),
      cardNumber,
    );
  }

  // public async getOffersInCache(
  //  storeId: number,
  //  emailAddress: string,
  // ): Promise<string> {
  //  return await this.getRawMarsMessageInCache(
  //    this.buildOffersKey(storeId, emailAddress),
  //  );
  // }

  // public async storeOffersInCache(
  //  storeId: number,
  //  emailAddress: string,
  //  offers: JSON,
  // ): Promise<boolean> {
  //  return await this.storeRawMarsMessageInCache(
  //    this.buildOffersKey(storeId, emailAddress),
  //    offers,
  //    OFFERS_EXPIRATION_SECONDS,
  //  );
  // }

  // public async removeOffersInCache(
  //  storeId: number,
  //  emailAddress: string,
  // ): Promise<boolean> {
  //  return await this.redisClient.deleteKey(
  //    this.buildOffersKey(storeId, emailAddress),
  //  );
  // }

  public async updatePowercardTransactionState(
    transactionUuid: string,
    transactionState: POWERCARD_TRANSACTION_STATE,
    cardNumber?: string,
  ) {
    const powercardTransactionState = {
      transactionUuid,
      transactionState,
      cardNumber: cardNumber ? cardNumber : '',
    };

    await this.redisClient.storeByKey(
      this.buildTransactionStateKey(transactionUuid),
      JSON.stringify(powercardTransactionState),
    );
  }

  public async deletePowercardTransactionState(transactionUuid: string) {
    await this.redisClient.deleteKey(
      this.buildTransactionStateKey(transactionUuid),
    );
  }

  public async getPowercardNumberFromPowercardUuidInCache(
    uuid: string,
  ): Promise<string> {
    return await this.redisClient.getByKey(
      this.buildPowercardNumberLookupKey(uuid),
    );
  }

  public async markTicketSessionStartedInCache(
    cardNumber: string,
    expirationSeconds: number,
  ) {
    await this.redisClient.storeByKeyWithExpiration(
      this.buildTicketSessionInProgressKey(cardNumber),
      'true',
      expirationSeconds,
    );
  }

  public async markTicketSessionCompletedInCache(cardNumber: string) {
    await this.redisClient.deleteKey(
      this.buildTicketSessionInProgressKey(cardNumber),
    );
  }

  public async ticketSessionInProgress(cardNumber: string) {
    const ticketSessionIsInProgress = await this.redisClient.getByKey(
      this.buildTicketSessionInProgressKey(cardNumber),
    );
    return ticketSessionIsInProgress === 'true';
  }

  public buildPowercardNumberValidKey(cardNumber: string) {
    return `${cardNumber}__POWERCARD_VALID`;
  }

  public buildPowercardUuidLookupKey(cardNumber: string) {
    return `${cardNumber}__POWERCARD_UUID_LOOKUP`;
  }

  public buildTicketSessionInProgressKey(cardNumber: string) {
    return `${cardNumber}__TICKET_SESSION_IN_PROGRESS`;
  }

  public buildPowercardNumberLookupKey(uuid: string) {
    return `${uuid}__POWERCARD_NUMBER_LOOKUP`;
  }

  public buildPowercardBalanceKey(cardNumber: string) {
    return `${cardNumber.toString()}__POWERCARD_BALANCE`;
  }

  public buildRateCardForNewUserKey(
    version: number,
    storeId: number,
    paymentType: number,
  ) {
    if (version === -1) {
      version = 0;
    }
    return `DB__NEW_USER_RATE_CARD_${version}_${storeId}_${paymentType}`;
  }

  public buildRateCardForExistingUserKey(
    version: number,
    storeId: number,
    paymentType: number,
  ) {
    if (version === -1) {
      version = 0;
    }
    return `DB__EXISTING_USER_RATE_CARD_${version}_${storeId}_${paymentType}`;
  }

  //  public buildOffersKey(storeId: number, emailAddress: string) {
  //    return `DB__OFFERS_FOR_CUSTOMER_${emailAddress}_${storeId}`;
  //  }

  public buildLocationsKey() {
    return `DB__LOCATIONS`;
  }

  public buildTransactionStateKey(transactionUuid: string) {
    return `POWERCARD_TRANSACTION_STATE_${transactionUuid}`;
  }

  public async storeCheckUpdateInCache(
    storeId: number,
    payCode: string,
    check: JSON,
  ): Promise<boolean> {
    return await this.storeRawMarsMessageInCache(
      this.buildCheckUpdateKey(storeId, payCode),
      check,
      this.payAnywhereConfig.checkUpdateExpirationSeconds,
    );
  }

  public async getCheckUpdateInCache(
    storeId: number,
    payCode: string,
  ): Promise<JSON> {
    return await this.getRawMarsMessageInCache(
      this.buildCheckUpdateKey(storeId, payCode),
    );
  }

  public buildCheckUpdateKey(storeId: number, payCode: string) {
    return `DB__PAY_AT_TABLE_CHECK_UPDATE_${storeId}_${payCode}`;
  }

  public async storeTableUpdateInCache(
    tableUuid: string,
    tableUpdate: JSON,
  ): Promise<boolean> {
    return await this.storeRawMarsMessageInCache(
      this.buildTableUpdateKey(tableUuid),
      tableUpdate,
      this.payAnywhereConfig.checkUpdateExpirationSeconds,
    );
  }

  public async getTableUpdateInCache(tableUuid: string): Promise<JSON> {
    return await this.getRawMarsMessageInCache(
      this.buildTableUpdateKey(tableUuid),
    );
  }

  public buildTableUpdateKey(tableUuid: string) {
    return `DB__PAY_AT_TABLE_TABLE_UPDATE_${tableUuid}`;
  }

  public async invalidateCheckUpdateInCache(storeId: number, payCode: string) {
    await this.redisClient.deleteKey(
      this.buildCheckUpdateKey(storeId, payCode),
    );
  }

  public async invalidateTableUpdateInCache(tableUuid: string) {
    await this.redisClient.deleteKey(this.buildTableUpdateKey(tableUuid));
  }
}
