import {
  QueueOptionsDto,
  BuildQueueDto,
  RabbitmqService,
} from '@open-commerce/nestjs-rabbitmq';
import { Injectable, Inject, flatten } from '@nestjs/common';
import { ReceiptEmailBuilder } from './receipt-email-builder';
import {
  RATING_REPOSITORY_TOKEN,
  POWERCARD_REPOSITORY_TOKEN,
  TRANSACTION_REPOSITORY_TOKEN,
  POWERCARD_IMAGE_PACK_REPOSITORY_TOKEN,
  TRANSACTION_SERVICE_TOKEN,
  CUSTOMER_SERVICE_TOKEN,
  MOBILE_PASS_SERVICE_TOKEN,
  POWERCARD_BALANCE_SNAPSHOT_REPOSITORY_TOKEN,
  RECEIPT_REPOSITORY_TOKEN,
  NOTIFICATION_SERVICE_CLIENT_TOKEN,
  RABBITMQ_SERVICE_TOKEN,
  TABLE_GUID_REPOSITORY_TOKEN,
  RECEIPT_EMAIL_BUILDER_TOKEN,
  PROMO_IMAGE_REPOSITORY_TOKEN,
  DEFAULT_TIMEZONE,
} from './constants/powercard.constants';
import { Repository } from 'typeorm';
import {
  Rating,
  Powercard,
  Transaction,
  PowercardImagePack,
  PowercardBalanceSnapshot,
  Receipt,
  TableGuid,
  PromoImage,
  IImage,
  EmailInputDto,
  CheckPaymentApplyInputDto,
  CHECK_LINE_ITEM_TYPE,
  ICheck,
  IPowercardConfigItem,
  ITransactionPowercard,
  IPowercard,
  IPowercardImagePack,
  PowercardCreateDto,
  POWERCARD_COUNTRY,
  PowercardUpdateAttributesDto,
  VirtualPowercardCreateDto,
  ITransaction,
  OFFER_PAYMENT_TYPE,
  PowercardOfferListDto,
  OFFER_TYPE,
  PowercardFundsAddDto,
  POWERCARD_STATUS_TYPE,
  IRateCard,
  RateCardFilterDto,
  RewardAccountInputDto,
  ICheckLineItem,
  DAVE_BUSTERS_ITEM_TYPE,
  DaveAndBustersItemDto,
  TRANSACTION_PURCHASE_TYPE,
  DaveAndBustersTransactionStartDto,
  TRANSACTION_STATUS,
  IRateCardItem,
  RateCardRequestDto,
} from '@open-commerce/data-objects';
import { MARS_API_TOKEN } from '../mars/mars.constants';
import { MarsService } from '../mars/mars.service';
import {
  TransactionServiceGraphqlClient,
  CustomerServiceGraphqlClient,
  PassManagementServiceGraphqlClient,
  NotificationServiceGraphqlClient,
  ClientServiceResponse,
} from '@open-commerce/internal-services-api';
import {
  ENABLE_CONFIG_LOGGING,
  PAY_ANYWHERE_CONFIG,
  POWERCARD_SERVICE_CONFIG,
} from '../../config/config.constants';
import { IPayAnywhereConfig } from '../../config/pay-anywhere-config.interface';
import { IPowercardServiceConfig } from '../../config/powercard-service-config.interface';
import { MarsCachingService } from '../mars-caching/mars-caching.service';
import { OCPayAtTableReceiptNotFoundError } from '../../errors/OCPayAtTableReceiptNotFoundError';
import { sortBy, get, sum, isEmpty, compact, pick, uniqBy } from 'lodash';
import { OCPayAtTableStoreLocationNotFoundError } from '../../errors/OCPayAtTableStoreLocationNotFoundError';
import { OCPayAtTableCouldNotSendEmailReceiptError } from '../../errors/OCPayAtTableCouldNotSendReceiptEmail';
import { mockCheckUpdate } from './__tests__/__mocks__/mock-check-update';
import { mockTableUpdate } from './__tests__/__mocks__/mock-table-update';
import { generateMarsAuthorizationCode } from './utils/generateMarsAuthorizationCode';
import { OCPayAtTablePaymentFailedError } from '../../errors/OCPayAtTablePaymentFailedError';
import { OCPayAtTableCheckNotFoundError } from '../../errors/OCPayAtTableCheckNotFoundError';
import { OCPayAtTableTableNotFoundError } from '../../errors/OCPayAtTableTableNotFoundError';
import {
  OCPayAtTableTransactionNotFoundError,
  OC_PAY_AT_TABLE_TRANSACTION_NOT_FOUND_ERROR,
} from '../../errors/OCPayAtTableTransactionNotFoundError';
import { OCPayAtTableCouldNotCreateAppRatingError } from '../../errors/OCPayAtTableCouldNotCreateAppRatingError';
import { OCPowercardDuplicateError } from './errors/powercard-duplicate.error';
import { OCUserInputError } from '../../errors/OCUserInputError';
import { IResponse } from '../brand-graphql/interfaces/response.interface';
import { OCPowercardCustomerAlreadyHasVirtualPowercardError } from './errors/powercard-virtual-powercard-exists.error';
import { offerPaymentTypeToNumberMap } from './constants/offer-payment-type-map';
import { POWERCARD_TRANSACTION_STATE } from './powercard-transaction-state.enum';
import { OCPowercardMarsCardActivateDigitalFailedError } from './errors/powercard-mars-card-activate-digital-failed.error';
import { IPowercardOffer } from '../mars/interfaces/IPowercardOffer';
import { CardBalancesMultipleRequestDto } from '../mars/dto/CardBalancesMultipleRequest.dto';
import { CardRechargeRequestDto } from '../mars/dto/CardRechargeRequest.dto';
import { OCPowercardMarsRechargeFailedError } from './errors/powercard-mars-recharge-failed.error';
import { IRewardHistory } from '../mars/interfaces/IRewardHistory.interface';
import { IRewardTransaction } from '../mars/interfaces/IRewardTransaction.interface';
import { CardBalanceRequestDto } from '../mars/dto/CardBalanceRequest.dto';
import { ApolloError } from 'apollo-server-express';
import { IPowercardOfferListResponse } from '../mars/interfaces/IPowercardOfferListResponse.interface';
import { OCPowercardRewardMemberCreateFailedError } from './errors/powercard-reward-member-create-failed.error';
import { OCPowercardRewardMemberUpdateFailedError } from './errors/powercard-reward-member-update-failed.error';
import { OCPowercardRewardEmailUpdateFailedError } from './errors/powercard-reward-email-update-failed.error';
import { IStoreLocation } from '../mars/interfaces/IStoreLocation.interface';
import { OfferRedeemRequestDto } from '../mars/dto/OfferRedeemRequest.dto';
import { OCPowercardBalanceSnapshotCreationFailedError } from './errors/powercard-balance-snapshot-creation-failed.error';
import { OCPowercardImagePackNotFoundError } from './errors/powercard-image-pack-not-found.error';
import { ICardActivateResponse } from '../mars/interfaces/ICardActivateResponse.interface';
import { powercardStatusMap } from './constants/powercard-status-map';
import { OCPowercardTransactionStartFailedError } from './errors/powercard-transaction-start-failed.error';
import { OCPowercardTransactionStartFailedByPaymentError } from './errors/powercard-transaction-start-failed-by-payment.error';
import { OCPayAtTableTransactionStartFailedError } from '../../errors/OCPayAtTableTransactionStartFailedError';
import { OCPayAtTableTransactionStartFailedByPaymentError } from '../../errors/OCPayAtTableTransactionStartFailedByPaymentError';
import { OCPowercardNotFoundError } from './errors/powercard-not-found.error';
import { OCPowercardMobilePassUpdateFailedError } from './errors/powercard-mobile-pass-update-failed.error';
import { OCPowercardTransactionVoidFailedError } from './errors/powercard-transaction-void-failed.error';
import { OfferListRequestDto } from '../mars/dto/OfferListRequest.dto';
import { OCPowercardRateCardItemsNotFoundError } from './errors/powercard-rate-card-items-not-found.error';
import { OCPowercardFailedToSaveError } from './errors/powercard-failed-to-save.error';
import { OCPowercardMarsGetBalancesMultipleFailedError } from './errors/powercard-mars-get-balances-multiple-failed.error';
import { OCPowercardMarsCardNotFoundError } from './errors/powercard-mars-card-not-found.error';
import { OCPowercardCustomerUpdateFailedError } from './errors/powercard-customer-update-failed.error';
import * as geoTz from 'geo-tz';
import { LoggerService } from '@open-commerce/nestjs-logger';
import assert = require('assert');
import states = require('us-state-codes');
import uuidv4 = require('uuid/v4');
import { PAY_AT_TABLE_CHECK_STATUS } from './pay-at-table-check-status.enum';
// import {
//   TRANSACTION_FRAGMENT,
//   TRANSACTION_SERVICE_ERROR,
// } from '../../../../open-commerce-shared/packages/internal-services-api/src/fragments';
// import { TRANSACTION_STATUS_UPDATE_MUTATION } from "./gqls/queries/transaction-status-update.mutation";

// tslint:disable-next-line: no-var-requires
const ordinal = require('ordinal');

const applePayIsIn = (paymentType: string) =>
  paymentType && paymentType.includes('APPLE_PAY');

const sleep = async (ms: number) =>
  new Promise(async resolve => setTimeout(resolve, ms));

const MARS_PAY_ANYWHERE_QUEUE_DETAILS = {
  queueName: 'MARS-PayAnywhere',
  options: {
    durable: true,
    noAck: true,
    arguments: {
      'x-dead-letter-exchange': 'MARS-PayAnywhere-DLX',
    },
  } as QueueOptionsDto,
} as BuildQueueDto;

const MARS_PAY_ANYWHERE_TABLE_GUID_QUEUE_DETAILS = {
  queueName: 'MARS-PayAnywhere-Table',
  options: {
    durable: true,
    noAck: true,
    arguments: {
      'x-dead-letter-exchange': 'MARS-PayAnywhere-Table-DLX',
    },
  } as QueueOptionsDto,
} as BuildQueueDto;

// const STUZO_EXCHANGE_DETAILS = {
//   exchangeName: 'STUZO',
//   type: 'fanout',
// } as BuildExchangeDto;
//
// const PAY_AT_TABLE_CHECK_UPDATE_QUEUE_DETAILS = {
//   queueName: 'PAY_AT_TABLE-checkUpdated',
//   options: {
//     durable: true,
//     noAck: true,
//   } as QueueOptionsDto,
// } as BuildQueueDto;
//
// const PAY_AT_TABLE_TABLE_UPDATE_QUEUE_DETAILS = {
//   queueName: 'PAY_AT_TABLE-tableUpdated',
//   options: {
//     durable: true,
//     noAck: true,
//   } as QueueOptionsDto,
// } as BuildQueueDto;

@Injectable()
export class PowercardService {
  // TODO: this is temporary cache for store locations, this will
  // be replaced with a redis cache implementation, but this is
  // fine for now.
  public storeLocations = {};
  private readonly loggerContext = this.constructor.name;

  constructor(
    private logger: LoggerService,
    @Inject(RATING_REPOSITORY_TOKEN)
    private readonly ratingRepository: Repository<Rating>,
    @Inject(POWERCARD_REPOSITORY_TOKEN)
    private readonly powercardRepository: Repository<Powercard>,
    @Inject(TRANSACTION_REPOSITORY_TOKEN)
    private readonly transactionRepository: Repository<Transaction>,
    @Inject(POWERCARD_IMAGE_PACK_REPOSITORY_TOKEN)
    private readonly powercardImagePackRepository: Repository<
      PowercardImagePack
    >,
    @Inject(MARS_API_TOKEN)
    private readonly marsService: MarsService,
    @Inject(TRANSACTION_SERVICE_TOKEN)
    private readonly transactionService: TransactionServiceGraphqlClient,
    @Inject(CUSTOMER_SERVICE_TOKEN)
    private readonly customerService: CustomerServiceGraphqlClient,
    @Inject(MOBILE_PASS_SERVICE_TOKEN)
    private readonly mobilePassService: PassManagementServiceGraphqlClient,
    @Inject(POWERCARD_BALANCE_SNAPSHOT_REPOSITORY_TOKEN)
    private readonly powercardBalanceSnapshotRepository: Repository<
      PowercardBalanceSnapshot
    >,
    @Inject(RECEIPT_REPOSITORY_TOKEN)
    private readonly receiptRepository: Repository<Receipt>,
    @Inject(NOTIFICATION_SERVICE_CLIENT_TOKEN)
    private readonly notificationServiceClient: NotificationServiceGraphqlClient,
    @Inject(RABBITMQ_SERVICE_TOKEN)
    private rabbitmqClient: RabbitmqService,
    @Inject(TABLE_GUID_REPOSITORY_TOKEN)
    private readonly tableGuidRepository: Repository<TableGuid>,
    @Inject(PROMO_IMAGE_REPOSITORY_TOKEN)
    private readonly promoImageRepository: Repository<PromoImage>,
    @Inject(PAY_ANYWHERE_CONFIG)
    private readonly payAnywhereConfig: IPayAnywhereConfig,
    @Inject(POWERCARD_SERVICE_CONFIG)
    private readonly powercardConfig: IPowercardServiceConfig,
    @Inject(RECEIPT_EMAIL_BUILDER_TOKEN)
    private readonly receiptEmailBuilder: ReceiptEmailBuilder,
    private readonly marsCachingService: MarsCachingService,
    @Inject(ENABLE_CONFIG_LOGGING)
    enableConfigLogging: boolean,
  ) {
    if (enableConfigLogging) {
      this.logger.debug(
        `Powercard Service Configuration:\n${JSON.stringify(
          this.powercardConfig,
          null,
          4,
        )}`,
        this.loggerContext,
      );
      this.logger.debug(
        `Pay Anywhere Configuration:\n${JSON.stringify(
          this.payAnywhereConfig,
          null,
          4,
        )}`,
        this.loggerContext,
      );

      if (this.powercardConfig.marsCreditLimitBypass) {
        this.logger.debug(
          {
            msg:
              'MARS Credit Limit Bypass enabled because MARS_CREDIT_LIMIT_BYPASS is true',
          },
          this.loggerContext,
        );
      }
    }
  }

  public async promoImages(): Promise<IImage[]> {
    let entities: PromoImage[];

    try {
      entities = await this.promoImageRepository.find({
        relations: ['image'],
      });
    } catch (error) {
      this.logger.error(
        {
          msg: `Cannot get list of promo images from Database. Error: ${error.message}`,
        },
        error.trace,
        this.loggerContext,
      );

      return [];
    }

    const images: IImage[] = entities.map(entity => entity.image);

    return images;
  }

  public async receiptEmail(
    emailAddress: string,
    storeId: number,
    payCode: string,
  ): Promise<boolean> {
    const receipt: Receipt = await this.receiptRepository
      .createQueryBuilder('receipt')
      .leftJoinAndSelect('receipt.lineItems', 'receipt_line_items')
      .where({
        storeId,
        payCode,
      })
      .orderBy({
        'receipt_line_items.lineNumber': 'ASC',
      })
      .getOne();

    if (!receipt) {
      throw new OCPayAtTableReceiptNotFoundError(storeId, payCode);
    }

    const transaction = await this.transactionRepository.findOneOrFail({
      uuid: receipt.transactionUuid,
    });

    if (!receipt.lineItems.length) {
      throw new Error('lineItems is empty');
    }

    sortBy(receipt.lineItems, item => {
      return new Date(item.createdAt);
    });

    let timezone: string;
    const storeLocation = await this.getStoreLocation(storeId);

    if (!storeLocation) {
      throw new OCPayAtTableStoreLocationNotFoundError(storeId);
    }

    this.logger.log(
      JSON.stringify({
        msg: 'got store location from mars api',
        storeLocation,
      }),
      this.loggerContext,
    );

    try {
      timezone = geoTz(storeLocation.latitude, storeLocation.longitude)[0];
    } catch (error) {
      this.logger.error(
        JSON.stringify({
          msg: `Couldn't parse timezone from store location. Looks like invalid latitude and longitude`,
          storeLocation,
        }),
        error.trace,
        this.loggerContext,
      );

      timezone = DEFAULT_TIMEZONE;
    }

    this.logger.log(
      {
        msg: 'start build email',
        timezone,
      },
      this.loggerContext,
    );

    try {
      // build email with receipt
      const emailInput: EmailInputDto = await this.receiptEmailBuilder.buildEmailInputDto(
        emailAddress,
        receipt,
        timezone,
        transaction,
      );

      // send receipt
      await this.notificationServiceClient.notificationSendEmail(emailInput);

      return true;
    } catch (error) {
      throw new OCPayAtTableCouldNotSendEmailReceiptError(error.message);
    }
  }

  public async triggerCheckUpdate(
    storeId: number,
    payCode: string,
  ): Promise<boolean> {
    mockCheckUpdate.payCode = payCode;
    mockCheckUpdate.storeId = storeId;

    await this.rabbitmqClient.sendMessageToExchange(
      'STUZO',
      'PAY_AT_TABLE.checkUpdated',
      JSON.stringify(mockCheckUpdate),
      { persistant: true, expiration: 360000 },
    );

    return true;
  }

  public async triggerTableUpdate(tableUuid: string): Promise<boolean> {
    this.logger.log(
      'triggering table update for tableGuid: ' + tableUuid,
      this.loggerContext,
    );

    await this.rabbitmqClient.sendMessageToExchange(
      'STUZO',
      'PAY_AT_TABLE.tableUpdated',
      JSON.stringify({
        tableUuid,
        tableUpdated: mockTableUpdate,
      }),
      { persistant: true, expiration: 360000 },
    );
    return true;
  }

  public async startListeningToPayAnywhereQueue() {
    if (this.powercardConfig.dontEnablePayAtTableListener) {
      return;
    }

    // Initialize queue connection
    await this.rabbitmqClient.initialize([MARS_PAY_ANYWHERE_QUEUE_DETAILS], []);

    const options = {
      noAck: true,
    } as QueueOptionsDto;

    // Define handler for when messages arrive
    const handler = async message => {
      await this.handleInboundMessage(message);
    };

    // Start listening to queue
    await this.rabbitmqClient.consumeFromQueue(
      MARS_PAY_ANYWHERE_QUEUE_DETAILS.queueName,
      handler,
      options,
    );

    // Initialize Table queue connection
    await this.rabbitmqClient.initialize(
      [MARS_PAY_ANYWHERE_TABLE_GUID_QUEUE_DETAILS],
      [],
    );

    // Define handler for when messages arrive
    const tableGuidUpdateHandler = async message => {
      await this.handleInboundTableGuidMessage(message);
    };

    // Start listening to queue
    await this.rabbitmqClient.consumeFromQueue(
      MARS_PAY_ANYWHERE_TABLE_GUID_QUEUE_DETAILS.queueName,
      tableGuidUpdateHandler,
      options,
    );
  }

  public async handleInboundMessage(rawMessage: any): Promise<boolean> {
    if (!rawMessage) {
      this.logger.debug(
        { msg: `Message was null. Ignoring.` },
        this.loggerContext,
      );
      return false;
    }

    const rawCheckUpdateMessage = rawMessage.content.toString();
    const checkUpdateMessage = JSON.parse(rawCheckUpdateMessage);

    this.logger.debug(
      {
        msg: 'Received message on PAY AT TABLE queue',
        ...checkUpdateMessage,
      },
      this.loggerContext,
    );

    const { StoreId, PayCode, TableNumber } = checkUpdateMessage;
    const sessionIsActiveForCheck = await this.sessionIsActiveForCheck(
      StoreId,
      PayCode,
      TableNumber,
    );

    if (sessionIsActiveForCheck) {
      await this.getLatestCheckDetailsAndUpdateCache(checkUpdateMessage);
      await this.getLatestCheckListForTableAndUpdateCache(checkUpdateMessage);
    }
  }

  public async handleInboundTableGuidMessage(
    rawMessage: any,
  ): Promise<boolean> {
    if (!rawMessage) {
      this.logger.debug(
        { msg: `Message was null. Ignoring.` },
        this.loggerContext,
      );
      return false;
    }

    const rawTableGuidUpdateMessage = rawMessage.content.toString();
    const tableGuidUpdateMessage = JSON.parse(rawTableGuidUpdateMessage);

    this.logger.debug(
      {
        msg: 'Received message on PAY AT TABLE GUID UPDATE queue',
        ...tableGuidUpdateMessage,
      },
      this.loggerContext,
    );

    const tableUuid = tableGuidUpdateMessage.Identifier;
    const storeId = tableGuidUpdateMessage.StoreId;
    const tableNumber = tableGuidUpdateMessage.TableNumber;

    // Find existing table GUID or create a new one, we are updating the mapping.
    const { id }: TableGuid =
      (await this.tableGuidRepository.findOne({ tableUuid })) ||
      new TableGuid();

    this.logger.debug(
      {
        msg: `Updating table GUID: ${tableUuid} with Store: ${storeId} and Table Number: ${tableNumber}`,
        ...tableGuidUpdateMessage,
      },
      this.loggerContext,
    );

    const updatedGuid: TableGuid = await this.tableGuidRepository.save({
      id,
      tableUuid,
      storeId,
      tableNumber,
    });

    this.logger.debug(
      {
        msg: 'Table GUID Updated!',
        updatedGuid,
      },
      this.loggerContext,
    );
  }

  public async checkPaymentApply(
    input: CheckPaymentApplyInputDto,
  ): Promise<Receipt> {
    const { nonce, payCode, storeId, emailAddress } = input;

    const check = await this.check(storeId, payCode);
    const items = this.formatPayAtTableItems(input, check.lineItems);

    const transaction = await this.payAtTableTransactionStart(
      items,
      input,
      check,
    );

    try {
      // Try to recharge and void if fails
      input.paymentInstrumentType = get(
        transaction,
        'paymentInfo.0.sourceCardType',
      );

      // Only need to do this it's a nonce transaction
      if (nonce) {
        input.paymentInstrumentUuid = this.generatePaymentInstrumentUuid(
          transaction,
        );
      }

      // Fix for double tip bug
      const dollarsPaidWithoutTip = +(input.dollarsPaid - input.tip).toFixed(2);
      const authorizationCode = generateMarsAuthorizationCode(transaction);

      this.logger.debug(
        {
          txId: input.paymentInstrumentUuid,
          authorizationCode,
        },
        'checkPaymentApply',
      );
      const { receipt } = await this.marsService.applyPayment({
        ...input,
        dollarsPaid: dollarsPaidWithoutTip,
        authorizationCode,
        emailAddress,
      });
      await this.makeCustomerNotNew(input);

      // There can be several payments to the same check, we don't want to keep creating new receipts...
      const existingReceipt = await this.receiptRepository.findOne({
        payCode,
        storeId,
      });
      receipt.id = get(existingReceipt, 'id');
      this.logger.debug(
        {
          txId: input.paymentInstrumentUuid,
          authorizationCode,
          receipt,
        },
        'checkPaymentApply',
      );
      // Calculate sum of tips and remove from amount paid, this is the number of rewardPoints
      const tipAmount = sum(
        receipt.lineItems
          .filter(item => item.itemType === CHECK_LINE_ITEM_TYPE.TIP)
          .map(item => item.amount),
      );

      receipt.rewardPoints = receipt.payment - tipAmount;
      receipt.transactionUuid = transaction.uuid;
      await this.receiptRepository.save(receipt);

      return receipt;
    } catch (error) {
      this.logger.error(
        { msg: `ERROR: Voiding transactions because ${error.message}` },
        error,
        this.loggerContext,
      );
      await this.transactionVoid(transaction.uuid);
      throw new OCPayAtTablePaymentFailedError();
    }
  }

  public async check(
    storeId: number,
    payCode: string,
    refreshCache: boolean = false,
  ): Promise<ICheck> {
    try {
      const checkResponse = await this.marsService.checkDetail(
        storeId,
        payCode,
        refreshCache,
      );
      const { check } = checkResponse;
      if (!check) {
        throw new OCPayAtTableCheckNotFoundError(storeId, payCode);
      }

      // remove references from check
      check.lineItems = check.lineItems.filter(this.lineItemsFilter);

      return check;
    } catch (error) {
      this.logger.error(
        {
          msg: 'Failed to retrieve check',
        },
        error,
        this.loggerContext,
      );

      throw new OCPayAtTableCheckNotFoundError(storeId, payCode);
    }
  }

  public async checkList(
    tableUuid: string,
    refreshCache: boolean = false,
  ): Promise<ICheck[]> {
    this.logger.log('GETTING CHECK LIST FOR: ' + tableUuid, this.loggerContext);

    try {
      const checkListResponse = await this.marsService.checkList(
        tableUuid,
        refreshCache,
      );

      let checkList: ICheck[] = get(checkListResponse, 'checkList', []);

      // Filter out checks with 0 due balance
      checkList = checkList.filter(check => check.due > 0);

      // Store all checks in the cache
      for (const check of checkList) {
        const { storeId, payCode } = check;
        await this.marsCachingService.storeCheckUpdateInCache(
          storeId,
          payCode,
          JSON.parse(
            JSON.stringify({
              check,
            }),
          ),
        );
      }

      // remove references from check
      checkList.forEach(check => {
        check.lineItems = check.lineItems.filter(this.lineItemsFilter);
      });

      return checkList;
    } catch (error) {
      this.logger.error(
        {
          errorName: error.name,
          errorMessage: error.message,
          msg: 'Failed to retrieve check list',
        },
        (error as Error).stack,
        this.loggerContext,
      );

      throw new OCPayAtTableTableNotFoundError(tableUuid);
    }
  }

  public async ratingCreate(
    transactionUuid: string,
    numberOfStars: number,
  ): Promise<boolean> {
    try {
      const transaction: Transaction = await this.transactionRepository.findOne(
        {
          where: { uuid: transactionUuid },
        },
      );

      if (!transaction) {
        throw new OCPayAtTableTransactionNotFoundError(transactionUuid);
      }

      const createdRating: Rating = await this.ratingRepository.create({
        numberOfStars,
        transaction,
      });

      await this.ratingRepository.save(createdRating);
      return true;
    } catch (e) {
      if (
        get(e, 'extensions.code') ===
        OC_PAY_AT_TABLE_TRANSACTION_NOT_FOUND_ERROR
      ) {
        throw new OCPayAtTableTransactionNotFoundError(transactionUuid);
      }

      throw new OCPayAtTableCouldNotCreateAppRatingError(e.message);
    }
  }

  public async receiptsClear(storeId: number, payCode: string) {
    return !!(await this.receiptRepository
      .createQueryBuilder()
      .delete()
      .where('storeId = :storeId AND payCode = :payCode', { storeId, payCode })
      .execute());
  }

  public async powercardConfigSet(
    config: IPowercardConfigItem[],
  ): Promise<IPowercardConfigItem[]> {
    const uuids = config.map((c: IPowercardConfigItem) => c.powercardUuid);
    const powercards = await this.powercardRepository
      .createQueryBuilder('powercard')
      .where('powercard.uuid IN (:...uuids)', { uuids })
      .getMany();

    const powercardsByUuid = new Map<string, Powercard>(
      powercards.map((p: Powercard) => [p.uuid, p]),
    );

    config.forEach(({ powercardUuid, easyRechargeEnabled }) => {
      powercardsByUuid.get(
        powercardUuid,
      ).easyRechargeEnabled = easyRechargeEnabled;
    });

    const savedPowercards = await this.powercardRepository.save(powercards);

    return savedPowercards.map(
      (p: Powercard) =>
        ({
          powercardUuid: p.uuid,
          easyRechargeEnabled: p.easyRechargeEnabled,
        } as IPowercardConfigItem),
    );
  }

  public async getLastQuantityOfPowercardChipsPurchaseByCustomer(
    powercardUuid: string,
    customerUuid: string,
  ): Promise<number> {
    const lastTransaction = await this.transactionRepository
      .createQueryBuilder('transaction')
      .innerJoin(
        PowercardBalanceSnapshot,
        'pbs',
        'transaction.uuid = pbs."transactionUuid"',
      )
      .leftJoinAndSelect('transaction.items', 'item')
      .where('transaction."customerUuid" = :customerUuid', { customerUuid })
      .andWhere(`item."itemDescription" = 'CHIP'`)
      .andWhere('pbs."powercardUuid" = :powercardUuid', { powercardUuid })
      .orderBy('transaction."updatedAt"', 'DESC')
      .getOne();
    return get(lastTransaction, 'items.0.qty');
  }

  public async powercardsForTransactions(
    transactionUuids: string[],
  ): Promise<ITransactionPowercard[]> {
    const powercardBalanceSnapshots = await this.powercardBalanceSnapshotRepository
      .createQueryBuilder('balanceSnapshot')
      .where('"transactionUuid" IN (:...transactionUuids)', {
        transactionUuids,
      })
      .innerJoinAndSelect('balanceSnapshot.powercard', 'powercard')
      .getMany();

    assert(
      !isEmpty(powercardBalanceSnapshots),
      'Could not find the powerard balance snapshots for transaction UUIDs: ' +
        transactionUuids,
    );

    return powercardBalanceSnapshots.map(snapshot => {
      const { powercard, transactionUuid } = snapshot;
      Object.assign(powercard, snapshot);

      return {
        powercard,
        transactionUuid,
      } as ITransactionPowercard;
    });
  }

  // FIXME: throws OCPowercardMarsGetBalancesMultipleFailedError
  // FIXME: throws OCPowercardMarsCardNotFoundError
  // FIXME: throws OCPowercardNotFoundError
  public async powercards(customerUuid: string): Promise<IPowercard[]> {
    const powercardsFromDatabase = await this.findByCustomerUuid(customerUuid);
    return await this.mergeCardBalances(powercardsFromDatabase);
  }

  // FIXME: throws OCPowercardMarsGetBalancesMultipleFailedError
  // FIXME: throws OCPowercardMarsCardNotFoundError
  // FIXME: throws OCPowercardNotFoundError
  public async powercard(powercardUuid: string): Promise<IPowercard> {
    const powercardFromDatabase = await this.findByUuid(powercardUuid);
    const powerCardWithBalances = await this.mergeCardBalances([
      powercardFromDatabase,
    ]);
    // it's always an array of one powercard, so it's safe to call array.pop();
    return powerCardWithBalances.pop();
  }

  public async queryPowercardsByPowercardNumber(powercardNumber: number) {
    await this.powercardRepository
      .createQueryBuilder()
      .where({
        cardNumber: powercardNumber,
      })
      .andWhere('Powercard.status IN (:...statuses)', {
        statuses: ['OPEN', 'VIP'],
      })
      .getMany();

    const powercards = await this.powercardRepository.find({
      cardNumber: powercardNumber.toString(),
    });
    return await this.mergeCardBalances(powercards);
  }

  public async powercardImages(): Promise<IPowercardImagePack[]> {
    const imagePacks = await this.findAllImagePacks();

    return imagePacks;
  }

  // FIXME: throws OCPowercardMarsValidateFailedError
  // FIXME: throws OCPowercardImagePackNotFoundError
  public async powercardCreate(input: PowercardCreateDto): Promise<IPowercard> {
    const addedPowercard = Object.assign(new Powercard(), {
      customerUuid: input.customerUuid,
      cardAlias: input.alias,
      cardEncoding: input.cardEncoding,
      cardNumber: input.cardNumber,
      rfidData: input.rfidData,
      easyRechargeEnabled: input.easyRechargeEnabled,
    });

    // See if card already exists for customer
    const powercardFromDatabase = await this.findByCardNumberAndCustomerUuid(
      input.cardNumber,
      input.customerUuid,
    );

    if (powercardFromDatabase) {
      throw new OCPowercardDuplicateError(input.cardNumber);
    }

    // This will throw if it fails.
    const validationResponse = await this.marsService.cardValidate(input);

    const selectedImagePack = await this.findImagePackByUuidOrGetDefault(
      input.imagePackUuid,
    );

    // Check if this is a rewards card and if yes, set all other rewards cards to false
    if (validationResponse.isRegistered) {
      await this.makeAllOtherPowercardsNotTheRewardCardFor(input.customerUuid);
    }

    Object.assign(addedPowercard, {
      imagePack: selectedImagePack,
      country: validationResponse.country,
      isRegisteredReward: validationResponse.isRegistered,
    });

    await this.refreshBalancesFor(addedPowercard);
    await this.save(addedPowercard);

    this.logger.debug(
      {
        msg: `added powercard to wallet ${JSON.stringify(addedPowercard)}`,
      },
      this.loggerContext,
    );

    return addedPowercard;
  }

  public async createPowercardInCustomerWallet(
    customerUuid: string,
    cardNumber: string,
    country: POWERCARD_COUNTRY,
  ): Promise<IPowercard> {
    const powercards = await this.powercards(customerUuid);
    const totalCardsAfterAddingToWallet = powercards.length + 1;

    const newPowercard = new Powercard();
    newPowercard.customerUuid = customerUuid;
    newPowercard.country = country;
    newPowercard.cardNumber = cardNumber;

    newPowercard.cardAlias = `My ${ordinal(totalCardsAfterAddingToWallet)}`;
    newPowercard.imagePack = await this.findImagePackByUuidOrGetDefault(null);
    await this.powercardRepository.save(newPowercard);

    this.logger.debug(
      {
        msg: `added powercard to wallet ${JSON.stringify(newPowercard)}`,
      },
      this.loggerContext,
    );

    return await this.powercard(newPowercard.uuid);
  }

  // FIXME: throws OCPowercardMarsSetRewardCardFailedError
  // FIXME: throws OCPowercardUserInputError
  // FIXME: throws OCPowercardImagePackNotFoundError
  public async powercardUpdate(
    powercardId: string,
    emailAddress: string,
    attributes: PowercardUpdateAttributesDto,
  ): Promise<IPowercard> {
    const cardToUpdate = await this.findByUuid(powercardId);
    const { cardNumber } = cardToUpdate;

    if (attributes.isRegisteredReward && !cardToUpdate.isRegisteredReward) {
      if (!emailAddress) {
        throw new OCUserInputError(
          'email must be provided when selecting a rewards powercard',
        );
      }

      try {
        await this.marsService.rewardsSetCardNumber({
          emailAddress,
          cardNumber,
        });
      } catch (error) {
        if (error.marsErrorMessage !== 'Card Number Already Registered') {
          throw error;
        }
      }

      await this.makeAllOtherPowercardsNotTheRewardCardFor(
        cardToUpdate.customerUuid,
      );
    }

    let updateAttributes = Object.assign(cardToUpdate, {
      ...attributes,
      cardAlias: attributes.alias,
    });

    if (attributes.imagePackUuid) {
      const imagePack = await this.findImagePackByUuidOrGetDefault(
        attributes.imagePackUuid,
      );

      updateAttributes = Object.assign(updateAttributes, {
        imagePack,
      });
    }

    const updatedCard = await this.save(updateAttributes);

    // Get power card balances from MARS
    const updatedCardWithBalances = await this.refreshBalancesFor(updatedCard);

    this.logger.debug(
      {
        msg: `updated powercard ${powercardId} with new attribute values: ${JSON.stringify(
          updatedCardWithBalances,
        )}`,
        powercardId,
      },
      this.loggerContext,
    );

    return updatedCardWithBalances;
  }

  // FIXME: throws OCPowercardMarsCardNotFoundError
  // FIXME: throws OCPowercardNotFoundError
  public async powercardDelete(powercardId: string): Promise<IResponse> {
    const response = await this.deleteByUuid(powercardId);
    this.logger.debug(
      { msg: `deleted powercard ${powercardId}` },
      this.loggerContext,
    );
    return response;
  }

  /*
    NOTE: This assumes that storeId that will be attributed with the sale is sent in input
    TODO: The additional receipt data for a virtual card transaction does not have a cardAlias.
    It hasn't been created at the time that the transaction addition receipt data is created.
    This might not be an non issue but want to call it out in case we ever use cardAlias.
  */
  public async powercardVirtualPurchaseCreate(
    input: VirtualPowercardCreateDto,
  ): Promise<ITransaction> {
    let powercardNumber = null;

    const {
      alias,
      isNewCustomer,
      customerUuid,
      paymentInstrumentType,
      offerId,
      imagePackUuid,
      emailAddress,
      nonce,
    } = input;

    assert(isNewCustomer !== undefined, 'isNewCustomer is undefined!');

    if (await this.customerAlreadyHasVirtualPowercard(customerUuid)) {
      throw new OCPowercardCustomerAlreadyHasVirtualPowercardError(
        customerUuid,
      );
    }

    let paymentType = OFFER_PAYMENT_TYPE.NONE;
    if (
      applePayIsIn(paymentInstrumentType) &&
      (await this.applePayOfferIsPresent(
        input.storeId,
        input.emailAddress,
        input.isNewCustomer,
      ))
    ) {
      paymentType = OFFER_PAYMENT_TYPE.APPLE_PAY;
    }

    const items = await this.findDaveAndBustersItemsOrFail(
      input,
      offerPaymentTypeToNumberMap[paymentType],
    );
    this.verifyDollarsPaid(items, input);

    // Disabled precheck 7-29-2019
    // await this.marsPrecheck(input, true);
    const transaction = await this.transactionStart(items, input, alias);

    await this.marsCachingService.updatePowercardTransactionState(
      transaction.uuid,
      POWERCARD_TRANSACTION_STATE.AUTHORIZED,
    );

    // Once the transaction has been successfully initiated, it must be
    // voided if any steps in the creation of the power card fail.
    try {
      input.paymentInstrumentType = get(
        transaction,
        'paymentInfo.0.sourceCardType',
      );

      // Only need to do this it's a nonce transaction
      if (nonce) {
        input.paymentInstrumentUuid = this.generatePaymentInstrumentUuid(
          transaction,
        );
      }

      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.ACTIVATING_VIRTUAL_POWERCARD,
      );

      const activateResponse = await this.marsCardActivateDigital(
        input,
        transaction,
      );

      powercardNumber = activateResponse.cardNumber;

      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.REDEEMING_OFFER,
        powercardNumber,
      );

      // If this transaction included an offer, redeem the offer
      await this.redeemOffer({
        // customerUuid,
        offerId,
        emailAddress,
        // paymentType,
      });

      const selectedImagePack = await this.findImagePackOrFail(imagePackUuid);

      await this.makeCustomerNotNew(input);

      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.CREATING_VIRTUAL_POWERCARD,
        powercardNumber,
      );

      const powercard = await this.buildVirtualPowercardAndSave(
        input,
        activateResponse,
        selectedImagePack,
      );

      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.CREATING_POWERCARD_SNAPSHOT,
        powercardNumber,
      );

      // Persist a snapshot of the powercard balances for this transaction.
      await this.createPowercardBalanceSnapshot(transaction.uuid, powercard);

      // Add the updated powercard to the returned transaction.
      transaction.powercard = powercard;

      await this.marsCachingService.deletePowercardTransactionState(
        transaction.uuid,
      );

      return transaction;
    } catch (error) {
      this.logger.error(
        { msg: `Voiding transactions because ${error.message}` },
        error,
        this.loggerContext,
      );
      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.VOIDING_TRANSACTION,
        powercardNumber,
      );

      await this.transactionVoid(transaction.uuid);

      await this.marsCachingService.deletePowercardTransactionState(
        transaction.uuid,
      );

      throw new OCPowercardMarsCardActivateDigitalFailedError(error.message);
    }
  }

  public async applePayOfferIsPresent(
    storeId: number,
    emailAddress: string,
    isNewCustomer: boolean,
  ): Promise<boolean> {
    const offerList = await this.offerList({
      storeId,
      emailAddress,
      isNewCustomer,
      paymentType: OFFER_PAYMENT_TYPE.APPLE_PAY,
    } as PowercardOfferListDto);

    // Return true if any of the offers contain the apple pay offer
    return !!offerList.offerList.find((o: IPowercardOffer) => {
      return o.offerTypes.includes(OFFER_TYPE.APPLE_PAY);
    });
  }

  // Throws OC_POWERCARD_MARS_RECHARGE_FAILED_ERROR
  public async powercardFundsAdd(
    input: PowercardFundsAddDto,
  ): Promise<ITransaction> {
    const {
      paymentInstrumentType,
      easyRechargeEnabled,
      offerId,
      emailAddress,
      nonce,
    } = input;
    const powercard = await this.findPowercardOrFail(input.uuid);

    // Determine which store the card is currently roamed to before starting the transaction
    // Update the input with that storeId
    // NOTE: input.storeId is not used for recharge!!!
    const cardBalancesMultipleRequestDto = new CardBalancesMultipleRequestDto();
    const cardBalanceRequestDto = new CardRechargeRequestDto();
    cardBalanceRequestDto.cardNumber = powercard.cardNumber;
    cardBalanceRequestDto.country = powercard.country;
    cardBalancesMultipleRequestDto.cards = [cardBalanceRequestDto];
    const powercardBalances = await this.marsService.cardBalancesMultiple(
      cardBalancesMultipleRequestDto,
    );

    if (!this.powercardConfig.enableStoreIdOverride) {
      input.storeId = powercardBalances.balances[0].storeId;
    }

    let paymentType = OFFER_PAYMENT_TYPE.NONE;
    if (
      applePayIsIn(paymentInstrumentType) &&
      (await this.applePayOfferIsPresent(
        input.storeId,
        input.emailAddress,
        input.isNewCustomer,
      ))
    ) {
      paymentType = OFFER_PAYMENT_TYPE.APPLE_PAY;
    }

    const items = await this.findDaveAndBustersItemsOrFail(
      input,
      offerPaymentTypeToNumberMap[paymentType],
    );
    this.verifyDollarsPaid(items, input);

    // Disabled precheck 7-29-2019
    // await this.marsPrecheck(input);

    // We need to pass some powercard attributes to transaction call.
    const transaction = await this.transactionStart(
      items,
      input,
      powercard.cardAlias,
      powercard.cardNumber,
    );

    await this.marsCachingService.updatePowercardTransactionState(
      transaction.uuid,
      POWERCARD_TRANSACTION_STATE.AUTHORIZED,
      powercard.cardNumber,
    );

    try {
      // If easy recharge is provided in input, update it on the power card now
      if (get(input, 'easyRechargeEnabled', null) !== null) {
        powercard.easyRechargeEnabled = !!easyRechargeEnabled;

        await this.save(powercard);
      }

      // Try to recharge and void if fails
      input.paymentInstrumentType = get(
        transaction,
        'paymentInfo.0.sourceCardType',
      );

      // Only need to do this it's a nonce transaction
      if (nonce) {
        input.paymentInstrumentUuid = this.generatePaymentInstrumentUuid(
          transaction,
        );
      }

      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.RECHARGING_POWERCARD,
        powercard.cardNumber,
      );

      await this.marsRecharge(powercard, input, transaction);

      // If this transaction included an offer, redeem the offer
      await this.redeemOffer({
        offerId,
        // customerUuid,
        emailAddress,
        // paymentType,
      });

      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.UPDATING_CUSTOMER,
        powercard.cardNumber,
      );

      await this.makeCustomerNotNew(input);

      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.CREATING_POWERCARD_SNAPSHOT,
        powercard.cardNumber,
      );

      // Persist a snapshot of the powercard balances for this transaction.
      await this.createPowercardBalanceSnapshot(transaction.uuid, powercard);

      try {
        // Update the balance on the associated mobile pass.
        await this.updateMobilePass(powercard);
      } catch (error) {
        this.logger.error(
          { msg: `Couldn't update mobile pass` },
          error,
          this.loggerContext,
        );
      }

      // Add the updated powercard to the returned transaction.
      transaction.powercard = powercard;

      await this.marsCachingService.deletePowercardTransactionState(
        transaction.uuid,
      );

      return transaction;
    } catch (error) {
      this.logger.error(
        { msg: `Voiding transactions` },
        error,
        this.loggerContext,
      );

      await this.marsCachingService.updatePowercardTransactionState(
        transaction.uuid,
        POWERCARD_TRANSACTION_STATE.VOIDING_TRANSACTION,
        powercard.cardNumber,
      );

      await this.transactionVoid(transaction.uuid);

      await this.marsCachingService.deletePowercardTransactionState(
        transaction.uuid,
      );

      throw new OCPowercardMarsRechargeFailedError(
        powercard.uuid,
        error.message,
      );
    }
  }

  // FIXME: throws OCPowercardMarsGetRewardCardFailedError
  // FIXME: throws OCPowercardFailedToLookupCountryError
  // FIXME: throws OCPowercardMarsGetRewardHistoryFailedError
  public async rewardHistory(
    emailAddress: string,
    lastPage: number,
  ): Promise<IRewardHistory> {
    const response = await this.marsService.rewardsGetCardNumber(emailAddress);
    const cardNumber = response.cardNumber.toString();

    const country = await this.countryForCardNumber(cardNumber);

    const history = await this.marsService.cardRewardsHistory({
      emailAddress,
      cardNumber,
      country,
      lastPage: lastPage || 0,
    });

    history.transactions = history.transactions.sort(
      (a: IRewardTransaction, b: IRewardTransaction) => {
        return a.transactionDate > b.transactionDate ? -1 : 1;
      },
    );

    return history;
  }

  // FIXME: throws OCPowercardNotFoundError
  // FIXME: throws OCPowercardMarsReactivateFailedError
  // FIXME: throws OCPowercardMarsGetBalancesMultipleFailedError
  public async powercardEnable(uuid: string): Promise<Powercard> {
    const powercardToEnable = await this.findByUuid(uuid);

    // This will throw if there is an error.
    await this.marsService.cardReActivate({
      cardNumber: powercardToEnable.cardNumber,
      country: powercardToEnable.country,
    });

    powercardToEnable.status = POWERCARD_STATUS_TYPE.OPEN;
    await this.refreshBalancesFor(powercardToEnable);
    return await this.save(powercardToEnable);
  }

  // FIXME: throws OCPowercardNotFoundError
  // FIXME: throws OCPowercardMarsDeactivateFailedError
  public async powercardDisable(
    uuid: string,
    reason: POWERCARD_STATUS_TYPE,
  ): Promise<IPowercard> {
    const powercardToDisable = await this.findByUuid(uuid);

    // This will throw if there is an error.
    await this.marsService.cardDeActivate({
      cardNumber: powercardToDisable.cardNumber,
      country: powercardToDisable.country,
    });

    powercardToDisable.status = reason || POWERCARD_STATUS_TYPE.DISABLED;
    this.copyBalances(powercardToDisable, {});

    return await this.save(powercardToDisable);
  }

  public async powercardMarkEasyRechargeNotificationSent(
    uuid: string,
  ): Promise<Powercard> {
    const powercard = await this.findByUuid(uuid);
    powercard.easyRechargeSent = true;
    await this.powercardRepository.save(powercard);
    return powercard;
  }

  public async powercardResetEasyRechargeNotificationSent(
    uuid: string,
  ): Promise<Powercard> {
    const powercard = await this.findByUuid(uuid);
    powercard.easyRechargeSent = false;
    await this.powercardRepository.save(powercard);
    return powercard;
  }

  // TODO: Should this throw a custom error?
  public async getRateCardByPowerCardUuid(
    powerCardUuid: string,
    isNewCustomer: boolean,
    paymentType = OFFER_PAYMENT_TYPE.NONE,
  ): Promise<IRateCard> {
    // 1. find the power card in the database
    const powerCard = await this.findByUuid(powerCardUuid);

    if (powerCard) {
      // 2. get current store for power card balances
      const powerCardBalanceRequest = new CardBalanceRequestDto();
      powerCardBalanceRequest.cardNumber = powerCard.cardNumber;
      powerCardBalanceRequest.country = powerCard.country;
      const powerCardBalance = await this.marsService.cardBalance(
        powerCardBalanceRequest,
      );

      if (powerCardBalance) {
        let storeId = powerCardBalance.storeId;

        // BUGFIX: HACK: This affects test env only, but without it we cannot test
        // digital powercard purchase because we need a valid store ID to
        // pass into MARS request, otherwise we receive `Get(x,4)` error (where x
        // is the invalid store ID passed into the MARS endpoint request).

        // If the issue in MARS where an invalid storeID is assigned to newly
        // created digital powercards in the test environment is ever fixed, we
        // can remove this hack code that is only here to allow us to get through QA
        // using the MARS test environment.
        if (this.powercardConfig.enableStoreIdOverride) {
          storeId = +this.powercardConfig.storeIdOverrideValue;
        }

        // Convert PaymentType enum value to number for MARS
        const paymentTypeNumber = offerPaymentTypeToNumberMap[paymentType];

        // 3. Get the rate card
        const rateCard: IRateCard = await this.marsService.rateCards({
          storeId,
          version: this.powercardConfig.rateCardVersion,
          isNewCustomer,
          paymentType: paymentTypeNumber,
        });

        rateCard.isNewCustomer = isNewCustomer;

        return this.postProcessRateCard(rateCard, paymentType);
      } else {
        throw new ApolloError('Card Number Not Found');
      }
    } else {
      throw new ApolloError('Card Number Not Found');
    }
  }

  public async getRateCards(filter: RateCardFilterDto): Promise<IRateCard> {
    // Convert PaymentType enum value to number for MARS
    const paymentTypeNumber = offerPaymentTypeToNumberMap[filter.paymentType];

    const rateCard: IRateCard = await this.marsService.rateCards({
      storeId: filter.storeId,
      version: this.powercardConfig.rateCardVersion,
      isNewCustomer: filter.isNewCustomer,
      paymentType: paymentTypeNumber,
    });

    rateCard.isNewCustomer = filter.isNewCustomer;

    return this.postProcessRateCard(rateCard, filter.paymentType);
  }

  public postProcessRateCard(
    rateCard: IRateCard,
    paymentType: OFFER_PAYMENT_TYPE,
  ): IRateCard {
    let totalOriginalPrice = 0;
    let totalPrice = 0;

    for (const item of rateCard.menuItemList) {
      totalOriginalPrice += item.originalPrice;
      totalPrice += item.price;
    }

    // I am hard coding this for speed
    const APPLE_PAY_OFFER_DISCOUNT = 50;
    const applePayPercent = APPLE_PAY_OFFER_DISCOUNT;
    const discountIsPresent = totalPrice < totalOriginalPrice;

    if (totalPrice === totalOriginalPrice - 10 * rateCard.menuItemList.length) {
      rateCard.rateCardHeadingText =
        '$10 FREE GAME PLAY (48 CHIPS INCLUDED) WITH 1ST PURCHASE!';
    } else if (rateCard.isNewCustomer && discountIsPresent) {
      const percent = 100 - (totalPrice / totalOriginalPrice) * 100;
      rateCard.discountPercentage = percent;

      if (applePayIsIn(paymentType)) {
        rateCard.offerCheckoutItemText = `${percent}% off with Apple Pay`;
      } else {
        // Populate the offer headings for the apple pay offer
        rateCard.offerHeadingText = `${applePayPercent}% OFF`;
        rateCard.offerRateCardSubHeadingText = `* Get an extra ${applePayPercent -
          percent}% off by using Apple Pay at checkout.`;
        rateCard.offerCheckoutSubHeadingText = `Use Apple Pay for our one time offer of a full`;

        if (rateCard.isNewCustomer && discountIsPresent) {
          rateCard.offerCheckoutItemText = `${percent}% off first time offer`;
        }
      }

      rateCard.rateCardHeadingText = `${percent}% OFF OF YOUR FIRST POWER CARD®`;
    } else {
      if (applePayIsIn(paymentType)) {
        rateCard.rateCardHeadingText = 'CHARGE UP YOUR PLAY!';
        rateCard.offerHeadingText = null;
        rateCard.offerCheckoutItemText = `${applePayPercent}% off with Apple Pay`;
        rateCard.offerRateCardSubHeadingText = null;
        rateCard.discountPercentage = 50;
      } else {
        rateCard.offerHeadingText = `${applePayPercent}% OFF`;
        rateCard.offerRateCardSubHeadingText = `* Get ${applePayPercent}% off by using Apple Pay at checkout.`;
        rateCard.rateCardHeadingText = 'CHARGE UP YOUR PLAY!';
        rateCard.discountPercentage = 0;
      }
    }

    return rateCard;
  }

  public async offerList(
    input: PowercardOfferListDto,
  ): Promise<IPowercardOfferListResponse> {
    const { storeId, emailAddress, isNewCustomer, paymentType } = input;

    const state = await this.stateFromStoreId(storeId);

    // Convert PaymentType enum value to number for MARS
    const paymentTypeNumber = offerPaymentTypeToNumberMap[paymentType];

    // TODO: FIXME: get these from a powercard?
    const chipCount = 0;
    const ticketCount = 0;

    const offerList = await this.marsService.offerList({
      storeId,
      emailAddress,
      isNewCustomer,
      state,
      paymentType: paymentTypeNumber,
      chipCount,
      ticketCount,
    });

    // Filter out any redeemed offers for this user
    // await this.filterOutRedeemedOffers(emailAddress, offerList);

    // Activation Fee: lookup the activation fee from rate card data
    const rateCardInput = {
      version: -1,
      isNewCustomer: true,
      storeId,
      paymentType: paymentTypeNumber,
    };

    const rateCard = await this.marsService.rateCards(rateCardInput);
    const { activationFee, activationItem } = rateCard;

    return {
      activationFee,
      activationItem,
      offerList: offerList.offers,
    } as IPowercardOfferListResponse;
  }

  public async rewardAccountCreate(
    input: RewardAccountInputDto,
  ): Promise<boolean> {
    try {
      const response = await this.marsService.rewardsAddMember(input);
      return response.success;
    } catch (error) {
      throw new OCPowercardRewardMemberCreateFailedError(error.message);
    }
  }

  public async rewardAccountUpdate(
    input: RewardAccountInputDto,
  ): Promise<boolean> {
    try {
      const updateResponse = await this.marsService.rewardsUpdateMember(input);
      return updateResponse.success;
    } catch (error) {
      throw new OCPowercardRewardMemberUpdateFailedError(error.message);
    }
  }

  public async rewardEmailUpdate(
    oldEmailAddress: string,
    newEmailAddress: string,
  ): Promise<boolean> {
    try {
      const response = await this.marsService.rewardsUpdateEmailAddress({
        oldEmailAddress,
        newEmailAddress,
      });
      return response.success;
    } catch (error) {
      throw new OCPowercardRewardEmailUpdateFailedError(error.message);
    }
  }

  public async findByCardNumberAndCustomerUuid(
    cardNumber: string,
    customerUuid: string,
  ): Promise<Powercard> {
    return await this.powercardRepository.findOne({
      where: [
        {
          cardNumber,
          customerUuid,
        },
      ],
      relations: [
        'imagePack',
        'imagePack.thumbnailImages',
        'imagePack.fullsizeImages',
      ],
    });
  }

  public async getStoreLocation(storeId: number): Promise<IStoreLocation> {
    const { locations } = await this.marsService.storeLocations();

    return (
      locations &&
      locations.find((l: IStoreLocation) => l.storeNumber === storeId)
    );
  }

  private async sessionIsActiveForCheck(
    storeId: number,
    payCode: string,
    tableNumber: number,
  ): Promise<boolean> {
    // Check if this check is in the cache, if not, check if its table is in the cache
    const checkIsInCache = !!(await this.marsCachingService.getCheckUpdateInCache(
      storeId,
      payCode,
    ));

    // Get the table UUIDs for this check, if any one of them is in the cache we should update the cache
    let tableIsInCache = false;
    const tableGuids = await this.tableGuidRepository.find({
      storeId,
      tableNumber,
    });
    const tableUuids = tableGuids.map(tg => tg.tableUuid);

    for (const uuid of tableUuids) {
      if (await this.marsCachingService.getTableUpdateInCache(uuid)) {
        tableIsInCache = true;
      }
    }

    return checkIsInCache || tableIsInCache;
  }

  private async getLatestCheckListForTableAndUpdateCache(
    checkUpdateMessage: any,
  ): Promise<ICheck[]> {
    const { StoreId, TableNumber } = checkUpdateMessage;

    // Process the table update
    const tableGuidsCollection = await this.tableGuidRepository.find({
      storeId: StoreId,
      tableNumber: TableNumber,
    });

    if (!tableGuidsCollection.length) {
      this.logger.warn(
        `PayAtTable: Haven\'t found stored tableGuids for ${JSON.stringify({
          storeId: StoreId,
          tableNumber: TableNumber,
        })}`,
        this.loggerContext,
      );
      return;
    }

    const tableGuids = tableGuidsCollection.map(t => t.tableUuid);

    for (const tableUuid of tableGuids) {
      // NOTE: Keep this code in case we need it in the future
      // await this.rabbitmqClient.sendMessageToExchange(
      //   'STUZO',
      //   'PAY_AT_TABLE.tableUpdated',
      //   JSON.stringify({
      //     tableUuid,
      //     tableUpdated: checks,
      //   }),
      //   { persistant: true, expiration: 360000 },
      // );

      try {
        await this.checkList(tableUuid, true);
      } catch (error) {
        this.logger.warn(
          'Could not pull check list for table: ' + tableUuid,
          this.loggerContext,
        );
        this.logger.error(
          { msg: error.message, error },
          'getLatestCheckListForTableAndUpdateCache',
          this.loggerContext,
        );

        // Remove invalid GUID from table, this is not the same as
        // valid GUID with empty check list.
        await this.tableGuidRepository.delete({ tableUuid });
      }
    }
  }

  private async getLatestCheckDetailsAndUpdateCache(
    checkUpdateMessage: any,
  ): Promise<ICheck> {
    const {
      PayCode,
      StoreId,
      TableNumber,
      TotalDue,
      StatusId,
    } = checkUpdateMessage;
    const payCode = PayCode;
    const storeId = StoreId;
    const tableNumber = TableNumber;

    // The check is closed, remove it from the cache
    if (StatusId === PAY_AT_TABLE_CHECK_STATUS.CLOSED) {
      await this.marsCachingService.invalidateCheckUpdateInCache(
        storeId,
        payCode,
      );

      // Invalidate all tableUuids associated with this storeId and payCode
      const tableGuids = await this.tableGuidRepository.find({
        storeId,
        tableNumber,
      });
      const tableUuids = tableGuids.map(tg => tg.tableUuid);
      for (const tableUuid of tableUuids) {
        await this.marsCachingService.invalidateTableUpdateInCache(tableUuid);
      }

      return null;
    }

    // Process the check update
    let check = await this.check(StoreId, PayCode, true);

    this.logger.debug(
      {
        msg: 'Pulled latest check details from MARS',
        ...check,
      },
      this.loggerContext,
    );

    // Check if this is the latest check data, retry if not
    const retryCount: number = this.payAnywhereConfig.checkRetryCount;
    const retryDelayMs: number = this.payAnywhereConfig.checkRetryDelay;

    for (
      let retriesLeft = retryCount;
      retriesLeft > 0 && check.due !== TotalDue;
      retriesLeft--
    ) {
      await sleep(retryDelayMs);

      check = await this.check(StoreId, PayCode, true);

      this.logger.debug(
        {
          msg: `Re-Pulled latest check details from MARS, ${retriesLeft} retries remaining`,
          ...check,
        },
        this.loggerContext,
      );
    }

    // If we still don't have the latest check details, bail out
    if (check.due !== TotalDue) {
      const message = `Failed to pull latest check details after ${(retryCount *
        retryDelayMs) /
        1000} seconds`;

      this.logger.error(
        {
          msg: message,
        },
        'getLatestCheckDetailsAndUpdateCache',
        this.loggerContext,
      );

      throw new Error(message);
    }

    // NOTE: Keep this code in case we need it in the future

    // await this.rabbitmqClient.sendMessageToExchange(
    //   'STUZO',
    //   'PAY_AT_TABLE.checkUpdated',
    //   JSON.stringify(check),
    //   { persistant: true, expiration: 360000 },
    // );

    return check;
  }

  private lineItemsFilter(item: ICheckLineItem): boolean {
    return item.itemType !== CHECK_LINE_ITEM_TYPE.REFERENCE;
  }

  private formatPayAtTableItems(
    input: CheckPaymentApplyInputDto,
    lineItems: ICheckLineItem[],
  ) {
    const items = lineItems
      .filter(item => item.itemType !== CHECK_LINE_ITEM_TYPE.REFERENCE)
      .map((lineItem: ICheckLineItem) => ({
        itemType: DAVE_BUSTERS_ITEM_TYPE.FOOD,
        quantity: lineItem.quantity,
        description: lineItem.description,
        price: {
          price: lineItem.amount,
          displayPrice: this.formatPrice(lineItem.amount),
        },
      })) as DaveAndBustersItemDto[];

    const tenderItem: DaveAndBustersItemDto = {
      quantity: 1,
      rateCardItemId: null,
      itemType: DAVE_BUSTERS_ITEM_TYPE.TENDER,
      price: {
        price: input.dollarsPaid,
        displayPrice: this.formatPrice(input.dollarsPaid),
      },
      description: input.paymentInstrumentType,
    };
    items.push(tenderItem);

    const tipItem: DaveAndBustersItemDto = {
      quantity: 1,
      rateCardItemId: null,
      itemType: DAVE_BUSTERS_ITEM_TYPE.TIP,
      price: {
        price: input.tip,
        displayPrice: this.formatPrice(input.tip),
      },
      description: 'Tip',
    };
    items.push(tipItem);
    return items;
  }

  // private async filterOutRedeemedOffers(
  //  emailAddress: string,
  //  offerList: IPowercardOfferList,
  // ) {
  //  const customerUuid = await this.customerUuidFromEmail(emailAddress);
  //  const offerIds = map(offerList.offers, 'offerId');
  //  const redeemedOffers = await this.offerRedemptionRepository
  //    .createQueryBuilder('o')
  //    .where('o."customerUuid"::uuid = :customerUuid', { customerUuid })
  //    .where('o."offerId" IN (:...offerIds)', { offerIds })
  //    .getMany();
  //  const idsToRemove = map(redeemedOffers, 'offerId');
  //  offerList.offers = reject(offerList.offers, (o: IPowercardOffer) =>
  //    idsToRemove.includes(o.offerId),
  //  );
  // }

  private async redeemOffer({
    // customerUuid,
    emailAddress,
    // paymentType,
    offerId,
  }) {
    if (offerId) {
      // UPDATE: we do not need to track offer redemption, we can keep using MARS to do that.
      // if payment type is apple pay, create an offer redemption in our table
      // if (applePayIsIn(paymentType)) {
      //  // Redeem in our backend database
      //  this.logger.debug(
      //    `Redeeming offer id ${offerId} for ${emailAddress} in backend database`,
      //  );
      //  await this.offerRedemptionRepository.save({
      //    customerUuid,
      //    offerId,
      //  });
      // } else {
      // Redeem in MARS
      this.logger.debug(
        {
          msg: `Redeeming offer id ${offerId} for ${emailAddress} in MARS`,
          offerId,
          emailAddress,
        },
        this.loggerContext,
      );
      const offerRedeemRequest = new OfferRedeemRequestDto();
      offerRedeemRequest.emailAddress = emailAddress;
      offerRedeemRequest.offerId = offerId;
      await this.marsService.offerRedeem(offerRedeemRequest);
      // }
    }
  }

  private async createPowercardBalanceSnapshot(
    transactionUuid: string,
    powercard: Powercard,
  ) {
    const powercardBalanceSnapshot = Object.assign(
      new PowercardBalanceSnapshot(),
      {
        ...powercard,
        transactionUuid,
        powercard,
      },
    );

    assert(
      powercardBalanceSnapshot.transactionUuid === transactionUuid,
      'invalid transactionUuid when creating powercard balance snapshot',
    );
    assert(
      powercardBalanceSnapshot.powercard.uuid === powercard.uuid,
      'invalid powercard when creating powercard balance snapshot',
    );

    try {
      await this.powercardBalanceSnapshotRepository.save(
        powercardBalanceSnapshot,
      );
    } catch (error) {
      throw new OCPowercardBalanceSnapshotCreationFailedError(error.message);
    }
  }

  private generatePaymentInstrumentUuid(transaction: any) {
    const cardType = get(transaction, 'paymentInfo.0.cardType');
    const sourceCardType = get(transaction, 'paymentInfo.0.sourceCardType');

    if (cardType !== sourceCardType) {
      return `${cardType}-${sourceCardType}-${get(transaction, 'customerId')}`;
    } else {
      return `${cardType}-${get(transaction, 'customerId')}`;
    }
  }

  private async customerAlreadyHasVirtualPowercard(
    customerUuid: string,
  ): Promise<boolean> {
    const result = await this.powercardRepository.findOne({
      customerUuid,
      isPhysical: false,
    });

    return !!result;
  }

  private async findImagePackOrFail(
    imagePackUuid: string,
  ): Promise<PowercardImagePack> {
    try {
      return await this.findImagePackByUuidOrGetDefault(imagePackUuid);
    } catch {
      throw new OCPowercardImagePackNotFoundError(imagePackUuid);
    }
  }

  private async buildVirtualPowercardAndSave(
    input: VirtualPowercardCreateDto,
    response: ICardActivateResponse,
    imagePack: PowercardImagePack,
  ) {
    const { cardStatusId, cardNumber, cardEncoding, country } = response;
    const { customerUuid, alias, easyRechargeEnabled } = input;

    const powercard = {
      ...new Powercard(),
      isPhysical: false,
      cardNumber,
      cardAlias: alias,
      customerUuid,
      cardEncoding,
      easyRechargeEnabled,
      country,
      status: powercardStatusMap[cardStatusId], // TODO move this status map into serializer
      imagePack,
    } as Powercard;

    await this.refreshBalancesFor(powercard);
    return await this.save(powercard);
  }

  private async marsCardActivateDigital(
    input: VirtualPowercardCreateDto,
    transaction: ITransaction,
  ) {
    const paymentInstrumentUuid = this.paymentInstrumentUuidOrCreditLimitBypassUuid(
      input,
    );

    try {
      const authorizationCode = generateMarsAuthorizationCode(transaction);
      return await this.marsService.cardActivateDigital({
        ...input,
        paymentInstrumentUuid,
        rateCardItemIds: compact(input.rateCardItemIds),
        authorizationCode,
      });
    } catch (error) {
      await this.transactionVoid(transaction.uuid);
      throw new OCPowercardMarsCardActivateDigitalFailedError(error.message);
    }
  }

  private async transactionStart(
    items: DaveAndBustersItemDto[],
    input: PowercardFundsAddDto | VirtualPowercardCreateDto,
    cardAlias: string,
    cardNumber?: string,
  ): Promise<ITransaction> {
    const chipsItem = items.find(
      item => item.itemType === DAVE_BUSTERS_ITEM_TYPE.CHIP,
    );
    const attractionItem = items.find(
      item => item.itemType === DAVE_BUSTERS_ITEM_TYPE.ATTRACTION,
    );
    const activationItem = items.find(
      item => item.itemType === DAVE_BUSTERS_ITEM_TYPE.ACTIVATION,
    );

    const transactionItems = [];

    if (chipsItem) {
      transactionItems.push(chipsItem);
    }
    if (attractionItem) {
      transactionItems.push(attractionItem);
    }
    if (activationItem) {
      transactionItems.push(activationItem);
    }

    const storeAddress = await this.addressForStoreId(input.storeId);

    const req: DaveAndBustersTransactionStartDto = {
      paymentInstruments: [input.paymentInstrumentUuid],
      amount: {
        price: input.dollarsPaid,
        displayPrice: this.formatPrice(input.dollarsPaid),
      },
      tax: {
        price: 0,
        displayPrice: this.formatPrice(0),
      },
      cardType: input.paymentInstrumentType,
      currency: {
        code: 'USA', // TODO: put this in config?
        symbol: '$',
      },
      customerUuid: input.customerUuid,
      items: transactionItems,
      storeNumber: input.storeId,
      nonce: input.nonce,
      storeName: get(storeAddress, 'storeName'),
      address: {
        alias: get(storeAddress, 'storeName'),
        street1: get(storeAddress, 'address'),
        city: get(storeAddress, 'city'),
        zipCode: get(storeAddress, 'zip'),
        state: get(storeAddress, 'state'),
      },
      cardNumber,
      cardAlias,
      billing: input.billing,
      purchaseType: TRANSACTION_PURCHASE_TYPE.POWERCARD,
    };

    this.logger.debug(
      { msg: `Starting transaction`, req: JSON.stringify(req) },
      this.loggerContext,
    );

    let transactionResponse: ClientServiceResponse;

    try {
      if (req.nonce) {
        //
        // transactionResponse = await this.transactionService.executeQuery(
        //   'transactionStatusUpdate',
        //   TRANSACTION_STATUS_UPDATE_MUTATION,
        //
        // );
        transactionResponse = await this.transactionService.daveAndBustersTransactionStartWithNonce(
          req,
        );
      } else {
        transactionResponse = await this.transactionService.daveAndBustersTransactionStartWithPaymentInstrument(
          req,
        );
      }
    } catch (error) {
      this.logger.error(
        (error as Error).message,
        (error as Error).stack,
        this.loggerContext,
      );
      throw new OCPowercardTransactionStartFailedError(error.message);
    }

    if (!get(transactionResponse, 'data.uuid')) {
      if (
        get(
          transactionResponse,
          'data.errorDetails.data.providerResponseType',
        ) === 'Authorization'
      ) {
        throw new OCPowercardTransactionStartFailedByPaymentError(
          get(
            transactionResponse,
            'data.errorDetails.data.providerResponseText',
            this.cyclicStringify(transactionResponse),
          ),
        );
      }
      throw new OCPowercardTransactionStartFailedError(
        get(
          transactionResponse,
          'data.errorDetails.data.providerResponseText',
          this.cyclicStringify(transactionResponse),
        ),
      );
    }

    return transactionResponse.data;
  }

  private async payAtTableTransactionStart(
    items: DaveAndBustersItemDto[],
    input: CheckPaymentApplyInputDto,
    check: ICheck,
  ): Promise<ITransaction> {
    const transactionItems = items;

    this.logger.log('CHECK DETAILS: ' + check, this.loggerContext);

    const storeAddress = await this.addressForStoreId(input.storeId);

    const req: DaveAndBustersTransactionStartDto = {
      paymentInstruments: [input.paymentInstrumentUuid],
      amount: {
        price: parseFloat(input.dollarsPaid.toFixed(2)),
        displayPrice: this.formatPrice(
          parseFloat(input.dollarsPaid.toFixed(2)),
        ),
      },
      cardType: input.paymentInstrumentType,
      currency: {
        code: 'USA', // TODO: put this in config?
        symbol: '$',
      },
      customerUuid: input.customerUuid,
      items: transactionItems,
      storeNumber: input.storeId,
      nonce: input.nonce,
      storeName: get(storeAddress, 'storeName'),
      address: {
        alias: get(storeAddress, 'storeName'),
        street1: get(storeAddress, 'address'),
        city: get(storeAddress, 'city'),
        zipCode: get(storeAddress, 'zip'),
        state: get(storeAddress, 'state'),
      },
      tax: {
        price: input.tax,
        displayPrice: this.formatPrice(input.tax),
      },
      cardAlias: null,
      cardNumber: null,
      billing: input.billing,
      purchaseType: TRANSACTION_PURCHASE_TYPE.PAY_AT_TABLE,
      checkNumber: check.checkNumber,
    };

    this.logger.debug(
      {
        message: `Starting payAtTableTransactionStart`,
        payload: req,
      },
      this.loggerContext,
    );

    let transactionResponse: ClientServiceResponse;

    try {
      if (req.nonce) {
        transactionResponse = await this.transactionService.daveAndBustersTransactionStartWithNonce(
          req,
        );
      } else {
        transactionResponse = await this.transactionService.daveAndBustersTransactionStartWithPaymentInstrument(
          req,
        );
      }
    } catch (error) {
      this.logger.error(error.message, error.stack, this.loggerContext);
      throw new OCPayAtTableTransactionStartFailedError();
    }

    if (!get(transactionResponse, 'data.uuid')) {
      const message = get(
        transactionResponse,
        'data.errorDetails.data.providerResponseText',
        this.cyclicStringify(transactionResponse),
      );
      this.logger.log({ msg: 'error: ' + message }, this.loggerContext);

      if (
        get(
          transactionResponse,
          'data.errorDetails.data.providerResponseType',
        ) === 'Authorization'
      ) {
        throw new OCPayAtTableTransactionStartFailedByPaymentError();
      }
      throw new OCPayAtTableTransactionStartFailedError();
    }

    return transactionResponse.data;
  }

  private formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  private cyclicStringify(obj: object): string {
    const cache = [];
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (cache.indexOf(value) !== -1) {
          // Circular reference found, discard key
          return;
        }
        // Store value in our collection
        cache.push(value);
      }
      return value;
    });
  }

  private async findPowercardOrFail(uuid: string) {
    try {
      return await this.findByUuid(uuid);
    } catch (error) {
      throw new OCPowercardNotFoundError(uuid);
    }
  }

  private async updateMobilePass(powercard: Powercard) {
    try {
      const updatedBalances = pick(powercard, [
        'cardNumber',
        'country',
        'gameChips',
        'videoChips',
        'rewardChips',
        'attractionChips',
        'tickets',
      ]);

      const response = await this.mobilePassService.updatePassOnDevice(
        updatedBalances,
      );

      if (response.statusText !== 'OK') {
        throw new OCPowercardMobilePassUpdateFailedError(response.statusText);
      }
    } catch (error) {
      if (error instanceof OCPowercardMobilePassUpdateFailedError) {
        // TODO: send these errors to rollbar
        throw error;
      }
      throw new OCPowercardMobilePassUpdateFailedError(error.message);
    }
  }

  private async marsRecharge(
    powercard: Powercard,
    input: PowercardFundsAddDto,
    transaction: ITransaction,
  ) {
    const paymentInstrumentUuid = this.paymentInstrumentUuidOrCreditLimitBypassUuid(
      input,
    );

    let response = null;
    try {
      const authorizationCode = generateMarsAuthorizationCode(transaction);
      const { cardNumber } = powercard;
      response = await this.marsService.cardRecharge({
        ...input,
        cardNumber,
        rateCardItemIds: compact(input.rateCardItemIds),
        paymentInstrumentUuid,
        authorizationCode,
      } as CardRechargeRequestDto);
    } catch (error) {
      await this.transactionVoid(
        transaction.uuid,
        error.timedOut,
        powercard.cardNumber,
      );
      throw new OCPowercardMarsRechargeFailedError(input.uuid, error.message);
    }

    if (response) {
      try {
        // merge mars response back into entity
        this.copyBalances(powercard, response);
      } catch (error) {
        this.logger.error({ msg: 'error' }, error, this.loggerContext);
      }

      try {
        // reset the easyRechargeSent flag
        await this.powercardResetEasyRechargeNotificationSent(input.uuid);
      } catch (error) {
        this.logger.error({ msg: 'error' }, error, this.loggerContext);
      }
    }
  }

  private paymentInstrumentUuidOrCreditLimitBypassUuid(
    input: VirtualPowercardCreateDto | PowercardFundsAddDto,
  ): string {
    return this.powercardConfig.marsCreditLimitBypass
      ? uuidv4()
      : input.paymentInstrumentUuid;
  }

  // Disabled precheck 7-29-2019
  // private async marsPrecheck(input: any, isActivation = false) {
  //   const paymentInstrumentUuid = this.paymentInstrumentUuidOrCreditLimitBypassUuid(
  //     input,
  //   );

  //   try {
  //     const precheckRequest = {
  //       ...input,
  //       rateCardItemIds: compact(input.rateCardItemIds),
  //       paymentInstrumentUuid,
  //       isActivation,
  //     } as CardPrecheckRequestDto;

  //     await this.marsService.cardPrecheck(precheckRequest);
  //   } catch (error) {
  //     throw new OCPowercardMarsPrecheckFailedError(
  //       input.uuid,
  //       error.marsErrorMessage,
  //     );
  //   }
  // }

  private async transactionVoid(
    transactionUuid: string,
    timedOut = false,
    cardNumber = '',
  ) {
    try {
      const response: ClientServiceResponse = await this.transactionService.getTransaction(
        transactionUuid,
      );
      const transaction: ITransaction = response.data;

      if (transaction.status !== TRANSACTION_STATUS.VOID_TRANSACTION) {
        await this.transactionService.daveAndBustersTransactionVoid(
          transactionUuid,
          timedOut
            ? 'Transaction request to MARS timed out'
            : 'MARS card transaction failed',
          timedOut,
          cardNumber,
        );
      }
    } catch (voidError) {
      // TODO: FIXME: we do not want to throw this!!
      throw new OCPowercardTransactionVoidFailedError(
        transactionUuid,
        voidError.message,
      );
    }
  }

  // Return rate card items mapped to DaveAndBustersItem type for transaction
  private getRateCardItems(
    selectedItemIds: number[],
    rateCardItems: IRateCardItem[],
    itemType: DAVE_BUSTERS_ITEM_TYPE,
  ): DaveAndBustersItemDto[] {
    if (!isEmpty(rateCardItems)) {
      const filteredItems = rateCardItems.filter(item =>
        selectedItemIds.includes(item.itemId),
      );

      if (!isEmpty(filteredItems)) {
        const mappedItems = filteredItems.map(item => {
          return {
            rateCardItemId: item.itemId,
            itemType,
            quantity: item.chips,
            price: {
              price: item.price,
            },
            description: null,
          };
        });

        return mappedItems;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private async findDaveAndBustersItemsOrFail(
    input: VirtualPowercardCreateDto | PowercardFundsAddDto,
    paymentType: number,
  ): Promise<DaveAndBustersItemDto[]> {
    try {
      const { rateCardItemIds, storeId } = input;
      const itemIds = compact(rateCardItemIds);
      const isNewCustomer = !!input.isNewCustomer;
      const rateCardRequest: RateCardRequestDto = {
        isNewCustomer,
        storeId,
        version: this.powercardConfig.rateCardVersion,
        paymentType,
      };

      const offerListRequest: OfferListRequestDto = {
        emailAddress: input.emailAddress,
        storeId,
      };

      // Throw error if no rate card items provided
      if (isEmpty(itemIds)) {
        throw new OCPowercardRateCardItemsNotFoundError(rateCardItemIds);
      }

      // Get offers for the customer
      const currentOffers = await this.marsService.offerList(offerListRequest);
      const currentOfferItems = currentOffers.offers.map(offer => offer.item);

      // Get the current rate card from MARS (or cached version)
      const currentRateCard = await this.marsService.rateCards(rateCardRequest);

      // Get all of the different item types
      const activationItem = this.getRateCardItems(
        itemIds,
        [get(currentRateCard, 'activationItem')],
        DAVE_BUSTERS_ITEM_TYPE.ACTIVATION,
      );
      const attractionItems = this.getRateCardItems(
        itemIds,
        get(currentRateCard, 'attractionItemList'),
        DAVE_BUSTERS_ITEM_TYPE.ATTRACTION,
      );
      const menuItems = this.getRateCardItems(
        itemIds,
        get(currentRateCard, 'menuItemList'),
        DAVE_BUSTERS_ITEM_TYPE.CHIP,
      );
      const offerItems = this.getRateCardItems(
        itemIds,
        currentOfferItems,
        DAVE_BUSTERS_ITEM_TYPE.CHIP,
      );

      return uniqBy(
        compact(
          flatten([activationItem, attractionItems, menuItems, offerItems]),
        ),
        item => {
          return item.rateCardItemId;
        },
      );
    } catch (error) {
      throw new OCPowercardRateCardItemsNotFoundError(
        input.rateCardItemIds,
        error,
      );
    }
  }

  private verifyDollarsPaid(
    items: DaveAndBustersItemDto[],
    input: PowercardFundsAddDto | VirtualPowercardCreateDto,
  ) {
    const expectedDollarsPaid = items.reduce(
      (sum: number, item: DaveAndBustersItemDto) =>
        sum + get(item, 'price.price', 0),
      0,
    );

    if (input.dollarsPaid !== expectedDollarsPaid) {
      throw new OCUserInputError(
        'dollarsPaid does not equal the sum of the item prices',
      );
    }
  }

  private async save(powercard: Powercard): Promise<Powercard> {
    const { cardAlias, cardNumber, customerUuid } = powercard;

    // Alias can never be blank, if user doesn't set it or clears it,
    // create default value based on the card count at time of creation.
    if (!cardAlias) {
      const [customerCards, cardCount] = await this.powercardRepository
        .createQueryBuilder()
        .where({ customerUuid })
        .orderBy('id')
        .getManyAndCount();

      // Existing card, use its creation index.
      let cardIndex =
        customerCards.findIndex(card => card.cardNumber === cardNumber) + 1;

      // It's a new card, add it to the end.
      if (cardIndex === 0) {
        cardIndex = cardCount + 1;
      }

      powercard.cardAlias = `My ${ordinal(cardIndex)}`;
    }

    try {
      return await this.powercardRepository.save(powercard);
    } catch (error) {
      throw new OCPowercardFailedToSaveError(powercard.uuid, error.message);
    }
  }

  private async findByUuid(uuid: string): Promise<Powercard> {
    return await this.powercardRepository.findOneOrFail(
      { uuid },
      {
        relations: [
          'imagePack',
          'imagePack.thumbnailImages',
          'imagePack.fullsizeImages',
        ],
      },
    );
  }

  private async findAllImagePacks(): Promise<PowercardImagePack[]> {
    return await this.powercardImagePackRepository.find({
      relations: ['thumbnailImages', 'fullsizeImages'],
    });
  }

  private async findImagePackByUuidOrGetDefault(
    uuid: string,
  ): Promise<PowercardImagePack> {
    let imagePack: PowercardImagePack;

    if (uuid) {
      imagePack = await this.powercardImagePackRepository.findOneOrFail(
        { uuid },
        { relations: ['thumbnailImages', 'fullsizeImages'] },
      );
    } else {
      imagePack = await this.powercardImagePackRepository.findOneOrFail(
        { name: 'default' },
        { relations: ['thumbnailImages', 'fullsizeImages'] },
      );
    }

    return imagePack;
  }

  private async findByCustomerUuid(customerUuid: string): Promise<Powercard[]> {
    assert(customerUuid, Error('customerUuid must be defined'));

    // Collect ids for balance retrieval
    const powercards = await this.powercardRepository.find({
      where: [
        {
          customerUuid,
        },
      ],
      order: {
        isPhysical: 'ASC',
        id: 'ASC',
      },
      relations: [
        'imagePack',
        'imagePack.thumbnailImages',
        'imagePack.fullsizeImages',
      ],
    });

    const balancesRequest = {
      cards: powercards.map(({ cardNumber, country }) => ({
        cardNumber,
        country,
      })),
    } as CardBalancesMultipleRequestDto;

    const balancesResponse = await this.marsService.cardBalancesMultiple(
      balancesRequest,
    );

    powercards.map((powercard, index) => {
      const marsCard = balancesResponse.balances[index];
      this.copyBalances(powercard, marsCard);
      powercard.rewardPoints = marsCard.rewardPoints || 0;
    });

    return powercards;
  }

  private async deleteByUuid(uuid: string): Promise<IResponse> {
    const powercard = await this.findByUuid(uuid);
    await this.powercardRepository.remove(powercard);

    return {
      success: true,
      status: 'removed powercard with id: ' + uuid,
    };
  }

  private async countryForCardNumber(cardNumber: string): Promise<string> {
    if (MarsService.isMocked()) {
      return 'USA';
    }

    const powercards = await this.powercardRepository.find({
      where: [
        {
          cardNumber,
        },
      ],
    });

    if (!powercards.length) {
      throw new ApolloError('Card Number Not Found');
    }

    // If there are multiple records with the same card number, use the first one.
    // We are assuming that a single powercard number is associated with one country.
    return powercards[0].country;
  }

  private async refreshBalancesFor(powercard: IPowercard): Promise<IPowercard> {
    try {
      const balancesResponse = await this.marsService.cardBalancesMultiple({
        cards: [
          {
            cardNumber: powercard.cardNumber,
            country: powercard.country,
          },
        ],
      });
      const balance = balancesResponse.balances[0];

      // merge mars response back into entity
      this.copyBalances(powercard, balance);
      return powercard;
    } catch (error) {
      throw new OCPowercardMarsGetBalancesMultipleFailedError(
        [powercard.uuid],
        error.message,
      );
    }
  }

  private async makeAllOtherPowercardsNotTheRewardCardFor(
    customerUuid: string,
  ) {
    return await this.powercardRepository
      .createQueryBuilder()
      .update()
      .set({ isRegisteredReward: false })
      .where({ customerUuid })
      .execute();
  }

  private copyBalances(to: IPowercard, from: any): void {
    to.attractionChips = from.attractionChips;
    to.gameChips = from.gameChips;
    to.pointsToNextReward = from.pointsToNextReward;
    to.rewardChips = from.rewardChips;
    to.rewardPoints = from.rewardPoints;
    to.tickets = from.tickets;
    to.videoChips = from.videoChips;
    to.cardEncoding = from.cardEncoding;
  }

  private async mergeCardBalances(
    powercards: Powercard[],
  ): Promise<Powercard[]> {
    const powercardBalances = await this.fetchCardBalances(powercards);
    const errors = [];
    return powercards.map(powercard => {
      const balance = powercardBalances.find(({ cardNumber }) => {
        return cardNumber === powercard.cardNumber;
      });

      if (!balance) {
        this.logger.error(
          {
            msg: 'Failed to retrieve balance for powercard number',
            cardNumber: powercard.cardNumber,
          },
          null,
          this.loggerContext,
        );
        // probably we should throw an error like "couldn't fetch card balance"
        errors.push(new OCPowercardMarsCardNotFoundError(balance.uuid));
      }
      return powercard;
    });
  }

  private async fetchCardBalances(
    powercards: Powercard[],
  ): Promise<IPowercard[]> {
    if (!powercards || powercards.length === 0) {
      return null;
    }

    const balancesRequest = {
      cards: powercards.map(({ cardNumber, country }) => ({
        cardNumber,
        country,
      })),
    } as CardBalancesMultipleRequestDto;

    const balancesResponse = await this.marsService.cardBalancesMultiple(
      balancesRequest,
    );

    powercards.forEach(powercard => {
      const marsCard = balancesResponse.balances.find(
        balance => balance.cardNumber === powercard.cardNumber,
      );

      if (!marsCard) {
        this.logger.warn(
          {
            msg: `Power Card ${powercard.cardNumber} does not exist in MARS for customer ${powercard.customerUuid}`,
            cardNumber: powercard.cardNumber,
            customerUuid: powercard.customerUuid,
          },
          this.constructor.name,
        );
      } else {
        this.copyBalances(powercard, marsCard);
        powercard.rewardPoints = marsCard.rewardPoints || 0;
      }
    });

    return powercards;
  }

  private async makeCustomerNotNew(
    input:
      | VirtualPowercardCreateDto
      | PowercardFundsAddDto
      | CheckPaymentApplyInputDto,
  ) {
    if (!get(input, 'isNewCustomer')) {
      return;
    }

    try {
      await this.customerService.customerUpdate(input.customerUuid, {
        isNewCustomer: false,
      });
    } catch (error) {
      throw new OCPowercardCustomerUpdateFailedError(
        `Failed to set isNewCustomer to 'false' for customer with uuid: ${input.customerUuid}, Error: ${error.message}`,
      );
    }
  }

  private async addressForStoreId(storeId: number) {
    const response = await this.marsService.storeLocations();
    response.locations.forEach(loc => {
      this.storeLocations[loc.storeNumber] = loc;
    });

    return this.storeLocations[storeId];
  }

  private async stateFromStoreId(storeId: number) {
    const { locations } = await this.marsService.storeLocations();
    const preferredLocation =
      locations.find((l: IStoreLocation) => l.storeNumber === storeId) ||
      ({} as any);

    return states.getStateCodeByStateName(preferredLocation.state);
  }

  // private async customerUuidFromEmail(emailAddress: string) {
  //  try {
  //    const response = await this.customerService.executeQuery(
  //      'customerByEmailAddress',
  //      `
  //    query {
  //      customerByEmailAddress(emailAddress: "${emailAddress}") {
  //        uuid
  //      }
  //    }
  //  `,
  //    );

  //    return get(response, 'data.uuid');
  //  } catch (error) {
  //    this.logger.error(error);
  //  }
  // }
}
