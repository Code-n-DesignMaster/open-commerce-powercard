import { config } from '../../../config/config';
import {
  MARS_CACHING_SERVICE_CONFIG,
  PAY_ANYWHERE_CONFIG,
  POWERCARD_SERVICE_CONFIG,
  ENABLE_CONFIG_LOGGING,
} from '../../../config/config.constants';
import { MockMarsAPI } from '../../mars/__mocks__/MockMarsAPI';
import { LoggerService } from '@open-commerce/nestjs-logger';
import {
  POWERCARD_IMAGE_PACK_REPOSITORY_TOKEN,
  POWERCARD_REPOSITORY_TOKEN,
  TRANSACTION_SERVICE_TOKEN,
  CUSTOMER_SERVICE_TOKEN,
  MOBILE_PASS_SERVICE_TOKEN,
  POWERCARD_BALANCE_SNAPSHOT_REPOSITORY_TOKEN,
  TRANSACTION_REPOSITORY_TOKEN,
  OFFER_REDEMPTION_REPOSITORY_TOKEN,
  RATING_REPOSITORY_TOKEN,
  RECEIPT_REPOSITORY_TOKEN,
  NOTIFICATION_SERVICE_CLIENT_TOKEN,
  TABLE_GUID_REPOSITORY_TOKEN,
  RABBITMQ_SERVICE_TOKEN,
  RECEIPT_EMAIL_BUILDER_TOKEN,
  PROMO_IMAGE_REPOSITORY_TOKEN,
} from '../constants/powercard.constants';
import { PowercardService } from '../powercard.service';
import { Test } from '@nestjs/testing';
import { MARS_API_TOKEN } from '../../mars/mars.constants';
import {
  Powercard,
  RateCardItem,
  DAVE_BUSTERS_ITEM_TYPE,
  PowercardImagePack,
  PowercardFundsAddDto,
  VirtualPowercardCreateDto,
  TRANSACTION_STATUS,
} from '@open-commerce/data-objects';
import { OC_BAD_USER_INPUT_ERROR } from '../../../errors/OCUserInputError';
import { OC_POWERCARD_NOT_FOUND_ERROR } from '../errors/powercard-not-found.error';
import { OC_POWERCARD_TRANSACTION_START_FAILED_ERROR } from '../errors/powercard-transaction-start-failed.error';
import { OC_POWERCARD_MARS_RECHARGE_FAILED_ERROR } from '../errors/powercard-mars-recharge-failed.error';
import { PAYMENT_INSTRUMENT_TYPE } from '../../brand/constants/payment-instrument-type.enum';
import { MarsCachingService } from '../../mars-caching/mars-caching.service';
import { OC_PAY_AT_TABLE_CHECK_NOT_FOUND_ERROR } from '../../../errors/OCPayAtTableCheckNotFoundError';
import { OC_PAY_AT_TABLE_TRANSACTION_NOT_FOUND_ERROR } from '../../../errors/OCPayAtTableTransactionNotFoundError';
import { OC_PAY_AT_TABLE_COULD_NOT_CREATE_APP_RATING_ERROR } from '../../../errors/OCPayAtTableCouldNotCreateAppRatingError';
import { mockCheckUpdate } from './__mocks__/mock-check-update';
import { OC_PAY_AT_TABLE_TABLE_NOT_FOUND_ERROR } from '../../../errors/OCPayAtTableTableNotFoundError';
import { OC_PAY_AT_TABLE_RECEIPT_NOT_FOUND_ERROR } from '../../../errors/OCPayAtTableReceiptNotFoundError';
import { OC_PAY_AT_TABLE_COULD_NOT_SEND_RECEIPT_EMAIL } from '../../../errors/OCPayAtTableCouldNotSendReceiptEmail';
import { mockReceipt } from './__mocks__/mock-receipt';
import { OC_PAY_AT_TABLE_STORE_LOCATION_NOT_FOUND_ERROR } from '../../../errors/OCPayAtTableStoreLocationNotFoundError';
import { CONFIG_TOKEN } from '@open-commerce/nestjs-config';
import { IStoreLocation } from '../../mars/interfaces/IStoreLocation.interface';
import { IStoreLocationsResponse } from '../../mars/interfaces/IStoreLocationsResponse.interface';
import { IRechargeResponse } from '../../mars/interfaces/IRechargeResponse.interface';
import { CardRechargeRequestDto } from '../../mars/dto/CardRechargeRequest.dto';
import { ICardActivateResponse } from '../../mars/interfaces/ICardActivateResponse.interface';

describe('Powercard Service', () => {
  let powercardService: PowercardService;

  const mockPowercards: Powercard[] = [
    {
      id: 1,
      uuid: 'test',
      cardNumber: '1000000606',
    },
    {
      id: 2,
      uuid: 'test2',
      cardNumber: 'unexisting in mars api',
    },
  ].map(attrs => Object.assign(new Powercard(), attrs));

  const mockOfferRedemptionRepo = {
    save: jest.fn(),
    createQueryBuilder: () => ({
      where: () => ({
        where: () => ({
          getMany: jest.fn(),
        }),
      }),
    }),
  };

  const mockPowercardRepository = {
    findOneOrFail: ({ uuid }) => {
      return mockPowercards.find(mock => mock.uuid === uuid);
    },
    findOne: ({ uuid }) => {
      return mockPowercards.find(mock => mock.uuid === uuid);
    },
    save: () => {
      return mockPowercards[0];
    },
  };

  const mockPowercardBalanceSnapshots = [];

  const mockPowercardBalanceRepository = {
    findOneOrFail: ({ uuid }) => {
      return mockPowercardBalanceSnapshots;
    },
    findOne: ({ uuid }) => {
      return mockPowercardBalanceSnapshots;
    },
    save: (input: any) => {
      return mockPowercardBalanceSnapshots[0];
    },
  };

  const mockPromoImageRepository = {
    find: jest.fn(),
  };

  const mockRabbitMqService = {};

  const mockRateCardItems: RateCardItem[] = [
    {
      id: 1,
      version: 4,
      price: 12,
      numberOfChips: 60,
      storeId: 81,
      itemType: DAVE_BUSTERS_ITEM_TYPE.CHIP,
    },
    {
      id: 2,
      version: 4,
      price: 5,
      numberOfChips: 0,
      storeId: 81,
      itemType: DAVE_BUSTERS_ITEM_TYPE.ATTRACTION,
    },
    {
      id: 3,
      version: 4,
      price: 3,
      numberOfChips: 0,
      storeId: 81,
      itemType: DAVE_BUSTERS_ITEM_TYPE.ACTIVATION,
    },
  ].map(attrs => Object.assign(new RateCardItem(), attrs));

  const mockMarsApi = new MockMarsAPI();
  const mockPowercardImagePack = new PowercardImagePack();
  const mockAuthorizationCode = 'test-fake-transaction-uuid-authorization-code';
  const mockTransaction = {
    uuid: mockAuthorizationCode,
    powercard: {
      cardNumber: '1234',
    },
    status: TRANSACTION_STATUS.CLOSED,
    paymentProviderTransactionId: mockAuthorizationCode,
  };
  // TODO: What do I do here
  const mockTransactionRepository = {
    findOneOrFail: jest.fn(transactionId => {
      return mockTransaction;
    }),
    findOne: jest.fn(),
  };

  const mockTransactionResponse = {
    success: true,
    data: mockTransaction,
  };
  const mockTransactionService = {
    daveAndBustersTransactionStartWithPaymentInstrument: async (
      input: any,
    ): Promise<any> => mockTransactionResponse,
    daveAndBustersTransactionStartWithNonce: () => mockTransactionResponse,
    // transactionVoid: () => {
    //  return { success: true, data: {} };
    // },
    daveAndBustersTransactionVoid: async (): Promise<any> => {
      return { success: true, data: {} };
    },
    getTransaction: () => ({ data: mockTransaction }),
  };

  const mockCustomerService = {
    customerUpdate: () => ({}),
    getBasicCustomerDetailsByUuid: () => ({
      defaultLocationId: 62,
    }),
  };

  const mockMobilePassService = {
    updatePassOnDevice: (updatedBalances: any): any => ({
      data: {},
    }),
  };

  const mockLocations = {
    locations: [
      {
        node: {
          brandSpecificLocationId: '5',
          distance: null,
          specialHours: null,
          address: {
            alias: 'PA, Philadelphia',
            street1: '325 N Christopher Columbus Blvd',
            street2: null,
            city: 'Philadelphia',
            state: 'Pennsylvania',
            zipCode: '19106',
          },
        },
      },
      {
        node: {
          brandSpecificLocationId: '38',
          distance: null,
          specialHours: null,
          address: {
            alias: 'PA, Philadelphia (Franklin Mills)',
            street1: '1995 Franklin Mills Cir',
            street2: null,
            city: 'Philadelphia',
            state: 'Pennsylvania',
            zipCode: '19154',
          },
        },
      },
    ],
  };

  const mockRedisService = {
    getByKey: () => ({}),
    deleteKey: () => ({}),
    storeByKey: () => ({}),
  };

  const mockEmailAddress = 'mockEmailAddress@mail.com';

  const mockRatingRepository = {
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockNumberOfStars = 3;

  const mockTableGuidRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockReceiptRepository = {
    findOneOrFail: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    buildEmailInputDto: jest.fn(),
  };

  const mockReceiptEmailBuilder = {
    buildEmailInputDto: jest.fn(),
  };

  const mockNotificationService = {
    notificationSendEmail: jest.fn(),
  };

  const mockConfig = {
    powercard: {
      rateCardVersion: -1,
      enableStoreIdOverride: false,
      storeIdOverrideValue: '',
      dontEnablePayAtTableListener: true,
      marsCreditLimitBypass: false,
      emailFromAddress: 'test@mail.com',
    },
    marsCaching: {
      powercardBalanceExpirationSeconds: 360,
      powercardValidExpirationSeconds: 360,
      rateCardExpirationSeconds: 360,
      locationsExpirationSeconds: 8640,
    },
    payAnywhere: {
      checkRetryCount: 10,
      checkRetryDelay: 15000,
      rabbitmq: {
        name: 'pay-rabbitmq',
        hostname: 'localhost',
        port: 5672,
        username: 'guest',
        password: 'guest',
        vhost: 'PAY',
        frameMax: 0,
        heartbeat: 0,
      },
      checkUpdateExpirationSeconds: 120,
    },
  };

  const mockTableUuid = 'mockTableUuid';
  const mockPayCode = 'mockPayCode';
  const mockStoreId = 1;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [],
      providers: [
        {
          provide: CONFIG_TOKEN,
          useValue: config,
        },
        {
          provide: MARS_CACHING_SERVICE_CONFIG,
          useValue: mockConfig.marsCaching,
        },
        {
          provide: PAY_ANYWHERE_CONFIG,
          useValue: mockConfig.payAnywhere,
        },
        {
          provide: POWERCARD_SERVICE_CONFIG,
          useValue: mockConfig.powercard,
        },
        {
          provide: MARS_API_TOKEN,
          useValue: mockMarsApi,
        },
        {
          provide: TRANSACTION_SERVICE_TOKEN,
          useValue: mockTransactionService,
        },
        {
          provide: CUSTOMER_SERVICE_TOKEN,
          useValue: mockCustomerService,
        },
        {
          provide: MOBILE_PASS_SERVICE_TOKEN,
          useValue: mockMobilePassService,
        },
        {
          provide: POWERCARD_BALANCE_SNAPSHOT_REPOSITORY_TOKEN,
          useValue: mockPowercardBalanceRepository,
        },
        {
          provide: TRANSACTION_REPOSITORY_TOKEN,
          useValue: mockTransactionRepository,
        },
        {
          provide: RECEIPT_REPOSITORY_TOKEN,
          useValue: mockReceiptRepository,
        },
        {
          provide: RECEIPT_EMAIL_BUILDER_TOKEN,
          useValue: mockReceiptEmailBuilder,
        },
        {
          provide: POWERCARD_REPOSITORY_TOKEN,
          useValue: mockPowercardRepository,
        },
        {
          provide: 'RedisService',
          useValue: mockRedisService,
        },
        {
          provide: POWERCARD_IMAGE_PACK_REPOSITORY_TOKEN,
          useValue: {
            find: () => mockPowercardImagePack,
            findOne: () => mockPowercardImagePack,
            findOneOrFail: () => mockPowercardImagePack,
            save: () => mockPowercardImagePack,
          },
        },
        {
          provide: RATING_REPOSITORY_TOKEN,
          useValue: mockRatingRepository,
        },
        {
          provide: OFFER_REDEMPTION_REPOSITORY_TOKEN,
          useValue: mockOfferRedemptionRepo,
        },
        {
          provide: NOTIFICATION_SERVICE_CLIENT_TOKEN,
          useValue: mockNotificationService,
        },
        {
          provide: TABLE_GUID_REPOSITORY_TOKEN,
          useValue: mockTableGuidRepository,
        },
        {
          provide: RABBITMQ_SERVICE_TOKEN,
          useValue: mockRabbitMqService,
        },
        {
          provide: PROMO_IMAGE_REPOSITORY_TOKEN,
          useValue: mockPromoImageRepository,
        },
        {
          provide: ENABLE_CONFIG_LOGGING,
          useValue: false,
        },
        // Mock redis service?
        PowercardService,
        MarsCachingService,
        LoggerService,
      ],
    }).compile();

    powercardService = module.get<PowercardService>(PowercardService);
  });

  describe('receiptEmail(emailAddress, storeId, payCode)', () => {
    it('should return OCPayAtTableReceiptNotFound if receipt not found', async () => {
      const { payCode, storeId } = mockReceipt;
      try {
        jest
          .spyOn(mockReceiptRepository, 'createQueryBuilder')
          .mockImplementation(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockReturnValueOnce(undefined),
          }));

        await powercardService.receiptEmail(mockEmailAddress, storeId, payCode);

        fail('Did not throw expected error');
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_PAY_AT_TABLE_RECEIPT_NOT_FOUND_ERROR,
        );
      }
    });

    it('should call receiptRepository.createQueryBuilder func', async () => {
      const { payCode, storeId } = mockReceipt;
      jest
        .spyOn(mockReceiptRepository, 'createQueryBuilder')
        .mockImplementation(() => ({
          leftJoinAndSelect: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          getOne: jest.fn().mockReturnValueOnce(mockReceipt),
        }));

      jest
        .spyOn(powercardService, 'getStoreLocation')
        .mockImplementation(async () => {
          return {
            latitude: 33.3790855,
            longitude: -86.80809,
          } as IStoreLocation;
        });

      await powercardService.receiptEmail(mockEmailAddress, storeId, payCode);

      expect(mockReceiptRepository.createQueryBuilder).toHaveBeenCalled();
    });

    it('should return OCPayAtTableStoreLocationNotFoundError if store location not found', async () => {
      try {
        jest
          .spyOn(mockReceiptRepository, 'createQueryBuilder')
          .mockImplementation(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockReturnValueOnce(mockReceipt),
          }));

        jest
          .spyOn(powercardService, 'getStoreLocation')
          .mockImplementation(() => undefined);

        jest
          .spyOn(mockNotificationService, 'notificationSendEmail')
          .mockImplementation(jest.fn().mockRejectedValue('error'));

        await powercardService.receiptEmail(
          mockEmailAddress,
          2,
          'invalid paycode',
        );

        fail('Did not throw expected error');
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_PAY_AT_TABLE_STORE_LOCATION_NOT_FOUND_ERROR,
        );
      }
    });

    it('should return OCPayAtTableCouldNotSendReceiptEmailError if could not sent email', async () => {
      try {
        jest
          .spyOn(mockReceiptRepository, 'createQueryBuilder')
          .mockImplementation(() => ({
            leftJoinAndSelect: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            orderBy: jest.fn().mockReturnThis(),
            getOne: jest.fn().mockReturnValueOnce(mockReceipt),
          }));

        jest
          .spyOn(powercardService, 'getStoreLocation')
          .mockImplementation(async () => {
            return {
              latitude: 33.3790855,
              longitude: -86.80809,
            } as IStoreLocation;
          });

        jest
          .spyOn(mockNotificationService, 'notificationSendEmail')
          .mockImplementation(jest.fn().mockRejectedValue('error'));

        await powercardService.receiptEmail(
          mockEmailAddress,
          2,
          'invalid paycode',
        );

        fail('Did not throw expected error');
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_PAY_AT_TABLE_COULD_NOT_SEND_RECEIPT_EMAIL,
        );
      }
    });
  });

  describe('ratingCreate(transactionUuid, numberOfStars)', () => {
    it('should return OCPayAtTableTransactionNotFoundError if transaction not found', async () => {
      try {
        await powercardService.ratingCreate(
          'fe21f922-c096-4251-a120-399085c1df8a',
          3,
        );

        fail('Did not throw expected error');
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_PAY_AT_TABLE_TRANSACTION_NOT_FOUND_ERROR,
        );
      }
    });
    it('If ratingCreate method called, ratingRepository.findOne should be invoked with same arguments', async () => {
      jest
        .spyOn(mockTransactionRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(mockTransaction));

      await powercardService.ratingCreate(
        mockTransaction.uuid,
        mockNumberOfStars,
      );

      const result = mockTransactionRepository.findOne;
      expect(result).toHaveBeenCalledWith({
        where: { uuid: mockTransaction.uuid },
      });
    });
    test('ratingRepository.fineOne should return mockTransaction', async () => {
      jest
        .spyOn(mockTransactionRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(mockTransaction));
      const result = await powercardService.ratingCreate(
        mockTransaction.uuid,
        3,
      );
      expect(!!result).toBeTruthy();
    });
    it('should return bool if rating was successfully created', async () => {
      jest
        .spyOn(mockTransactionRepository, 'findOne')
        .mockImplementation(() => Promise.resolve(mockTransaction));

      const isRatingCreated = await powercardService.ratingCreate(
        mockTransaction.uuid,
        mockNumberOfStars,
      );
      expect(isRatingCreated).toBeTruthy();
    });
    it('should return OCPayAtTableCouldNotCreateAppRatingError if could not create rating', async () => {
      try {
        jest
          .spyOn(mockTransactionRepository, 'findOne')
          .mockImplementation(() => Promise.resolve(mockTransaction));

        jest
          .spyOn(mockRatingRepository, 'create')
          .mockImplementation(jest.fn().mockRejectedValue('error'));

        await powercardService.ratingCreate(
          mockTransaction.uuid,
          mockNumberOfStars,
        );

        await powercardService.ratingCreate(
          mockTransaction.uuid,
          mockNumberOfStars,
        );

        fail('Did not throw expected error');
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_PAY_AT_TABLE_COULD_NOT_CREATE_APP_RATING_ERROR,
        );
      }
    });
  });

  describe.skip('check(storeId, payCode)', () => {
    it('If check method called, marsService.checkDetail should be invoked with same arguments', async () => {
      jest.spyOn(mockMarsApi, 'checkDetail');

      const result = await powercardService.check(mockStoreId, mockPayCode);

      expect(result).toMatchObject(mockCheckUpdate);
      expect(mockMarsApi.checkDetail).toHaveBeenCalledWith(
        mockStoreId,
        mockPayCode,
      );
    });

    it('If check not found, should throw OC_PAY_AT_TABLE_CHECK_NOT_FOUND_ERROR', async () => {
      jest
        .spyOn(mockMarsApi, 'checkDetail')
        .mockRejectedValueOnce(new Error('test error'));

      try {
        await powercardService.check(mockStoreId, mockPayCode);
        fail('Did not throw expected error');
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_PAY_AT_TABLE_CHECK_NOT_FOUND_ERROR,
        );
      }
    });
  });

  describe.skip('checkList(tableUuid)', () => {
    it('If checkList method called, marsService.checkList should be invoked with same arguments', async () => {
      jest.spyOn(mockMarsApi, 'checkList');

      const result = await powercardService.checkList(mockTableUuid);
      const check = result[0];

      expect(check).toMatchObject(mockCheckUpdate);
      expect(mockMarsApi.checkList).toHaveBeenCalledWith(mockTableUuid);
    });

    it('If table not found, should throw OC_PAY_AT_TABLE_TABLE_NOT_FOUND_ERROR', async () => {
      jest
        .spyOn(mockMarsApi, 'checkList')
        .mockRejectedValueOnce(new Error('test error'));

      try {
        await powercardService.checkList(mockTableUuid);
        fail('Did not throw expected error');
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_PAY_AT_TABLE_TABLE_NOT_FOUND_ERROR,
        );
      }
    });
  });

  describe('powercard(uuid)', () => {
    it('should return a powercard with exising balance for exising powercard(1000000606) in marsapi', async () => {
      const result = await powercardService.powercard('test');
      expect(result).toMatchSnapshot();
    });

    it('should return a powercard with exising balance for exising powercard in marsapi', async () => {
      const result = await powercardService.powercard('test2');
      expect(result).toMatchSnapshot();
    });
  });

  describe('powercardFundsAdd(input)', () => {
    const mockInput = {
      uuid: mockPowercards[0].uuid,
      storeId: 81,
      customerUuid: '1',
      rateCardItemIds: [1, 8],
      paymentInstrumentUuid: '69c2d3ac-aa81-4b6c-a00c-89cba0ff068c',
      paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
      // nonce: 'fake-nonce',
      country: 'USA',
      dollarsPaid: 15,
      emailAddress: 'test@email.com',
      isNewCustomer: true,
    } as PowercardFundsAddDto;

    it('should create a transaction, call recharge in the MARS API with the\
      paymentProviderTransactionId from the transaction response, and return an updated powercard with new chip balance', async () => {
      const input = {
        ...mockInput,
      } as PowercardFundsAddDto;

      const testChipCount = mockRateCardItems[0].numberOfChips;
      const transactionStartSpy = jest.spyOn(
        mockTransactionService,
        'daveAndBustersTransactionStartWithPaymentInstrument',
      );
      const findPowercardSpy = jest.spyOn(
        mockPowercardRepository,
        'findOneOrFail',
      );
      jest
        .spyOn(mockMarsApi, 'storeLocations')
        .mockResolvedValue(
          (mockLocations as unknown) as IStoreLocationsResponse,
        );
      // const marsPrecheckSpy = jest.spyOn(mockMarsApi, 'cardPrecheck');
      const marsRechargeSpy = jest
        .spyOn(mockMarsApi, 'cardRecharge')
        .mockImplementation(
          async (input: CardRechargeRequestDto): Promise<IRechargeResponse> => {
            expect(input.authorizationCode).toBe(
              mockTransaction.paymentProviderTransactionId,
            );
            return { gameChips: testChipCount } as IRechargeResponse;
          },
        );
      const customerServiceSpy = jest.spyOn(
        mockCustomerService,
        'customerUpdate',
      );
      const mobilePassServiceSpy = jest
        .spyOn(mockMobilePassService, 'updatePassOnDevice')
        .mockImplementationOnce(updatedBalances => {
          expect(updatedBalances.gameChips).toBe(testChipCount);
          return { statusText: 'OK' };
        });
      const balanceSpy = jest
        .spyOn(mockPowercardBalanceRepository, 'save')
        .mockImplementation(async input => {
          expect(input.transactionUuid).toBe(mockTransaction.uuid);
          expect(input.powercard.uuid).toBe(mockInput.uuid);
        });

      const result = await powercardService.powercardFundsAdd(input);
      const powercard = result.powercard;

      expect(findPowercardSpy).toHaveBeenCalled();
      // expect(marsPrecheckSpy).toHaveBeenCalled();
      expect(transactionStartSpy).toHaveBeenCalled();
      expect(marsRechargeSpy).toHaveBeenCalled();
      expect(customerServiceSpy).toHaveBeenCalledWith(expect.anything(), {
        isNewCustomer: false,
      });
      expect(mobilePassServiceSpy).toHaveBeenCalled();
      expect(balanceSpy).toHaveBeenCalled();
      expect(powercard.uuid).toBe(input.uuid);
      expect(powercard.gameChips).toBe(testChipCount);
    });

    it('should throw user input error if dollarsPaid does not match computed prices sum', async () => {
      const input = {
        ...mockInput,
        dollarsPaid: 1,
      } as PowercardFundsAddDto;

      try {
        await powercardService.powercardFundsAdd(input);
      } catch (error) {
        expect(error.extensions.code).toBe(OC_BAD_USER_INPUT_ERROR);
      }
    });

    it('should throw card not found error if UUID is not found', async () => {
      const findOneOrFail = mockPowercardRepository.findOneOrFail;
      mockPowercardRepository.findOneOrFail = jest
        .fn()
        .mockRejectedValue(new Error('test'));

      try {
        await powercardService.powercardFundsAdd(mockInput);
      } catch (error) {
        expect(error.extensions.code).toBe(OC_POWERCARD_NOT_FOUND_ERROR);
      } finally {
        mockPowercardRepository.findOneOrFail = findOneOrFail;
      }
    });

    // it('should throw precheck failed error if mars preheck throws error', async () => {
    //   const cardPrecheck = mockMarsApi.cardPrecheck;
    //   mockMarsApi.cardPrecheck = jest.fn().mockRejectedValue(new Error('test'));

    //   try {
    //     await powercardService.powercardFundsAdd(mockInput);
    //   } catch (error) {
    //     expect(error.extensions.code).toBe(
    //       OC_POWERCARD_MARS_PRECHECK_FAILED_ERROR,
    //     );
    //   } finally {
    //     mockMarsApi.cardPrecheck = cardPrecheck;
    //   }
    // });

    it('should throw transaction start failed error if transactionStart throws error', async () => {
      const transactionStart =
        mockTransactionService.daveAndBustersTransactionStartWithPaymentInstrument;
      mockTransactionService.daveAndBustersTransactionStartWithPaymentInstrument = jest
        .fn()
        .mockRejectedValue(new Error('test'));

      try {
        await powercardService.powercardFundsAdd(mockInput);
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_POWERCARD_TRANSACTION_START_FAILED_ERROR,
        );
      } finally {
        mockTransactionService.daveAndBustersTransactionStartWithPaymentInstrument = transactionStart;
      }
    });

    it('should void the transaction and throw recharge failed error if mars recharge throws error', async () => {
      const cardRecharge = mockMarsApi.cardRecharge;
      mockMarsApi.cardRecharge = jest.fn().mockRejectedValue(new Error('test'));
      const transactionVoidSpy = jest.spyOn(
        mockTransactionService,
        'daveAndBustersTransactionVoid',
      );

      try {
        await powercardService.powercardFundsAdd(mockInput);
      } catch (error) {
        expect(transactionVoidSpy).toHaveBeenCalledWith(
          mockTransaction.uuid,
          expect.anything(),
          false,
          '',
        );
        expect(error.extensions.code).toBe(
          OC_POWERCARD_MARS_RECHARGE_FAILED_ERROR,
        );
      } finally {
        mockMarsApi.cardRecharge = cardRecharge;
      }
    });
  });

  describe('powercardVirtualPurchaseCreate(input)', () => {
    const mockInput = {
      storeId: 81,
      alias: 'test alias',
      customerUuid: '1',
      rateCardItemIds: [1, 8],
      paymentInstrumentUuid: '69c2d3ac-aa81-4b6c-a00c-89cba0ff068c',
      paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
      // nonce: 'fake-nonce',
      country: 'USA',
      dollarsPaid: 15,
      emailAddress: 'test@email.com',
      isNewCustomer: true,
    } as VirtualPowercardCreateDto;

    it('should create a transaction, call cardActivateDigital in the MARS API with the\
      transactionUuid from the transaction response, and return a new virtual powercard', async () => {
      const input = {
        ...mockInput,
      } as VirtualPowercardCreateDto;

      const testChipCount = mockRateCardItems[0].numberOfChips;
      const transactionStartSpy = jest
        .spyOn(
          mockTransactionService,
          'daveAndBustersTransactionStartWithPaymentInstrument',
        )
        .mockImplementation(async input => {
          expect(input.authorizationCode).toBe(
            mockTransaction.paymentProviderTransactionId,
          );
        })
        .mockResolvedValue(mockTransactionResponse);

      // const marsPrecheckSpy = jest.spyOn(mockMarsApi, 'cardPrecheck');
      const marsCardActivateDigitalSpy = jest
        .spyOn(mockMarsApi, 'cardActivateDigital')
        .mockImplementation(async input => {
          expect(input.paymentInstrumentUuid).toBe(
            mockInput.paymentInstrumentUuid,
          );
          return ({
            powercard: { gameChips: testChipCount },
          } as unknown) as ICardActivateResponse;
        });

      const balanceSpy = jest
        .spyOn(mockPowercardBalanceRepository, 'save')
        .mockImplementation(async input => {
          expect(input.transactionUuid).toBe(mockTransaction.uuid);
          expect(input.powercard.uuid).toBe(mockPowercards[0].uuid);
        });

      const result = await powercardService.powercardVirtualPurchaseCreate(
        input,
      );

      const powercard = result.powercard;

      // expect(marsPrecheckSpy).toHaveBeenCalled();
      expect(transactionStartSpy).toHaveBeenCalled();
      expect(marsCardActivateDigitalSpy).toHaveBeenCalled();
      expect(balanceSpy).toHaveBeenCalled();
      expect(powercard.uuid).toBeTruthy();
      expect(powercard.gameChips).toBe(testChipCount);
    });

    it('should throw user input error if dollarsPaid does not match computed prices sum', async () => {
      const input = {
        ...mockInput,
        dollarsPaid: 1,
      } as VirtualPowercardCreateDto;

      try {
        await powercardService.powercardVirtualPurchaseCreate(input);
      } catch (error) {
        expect(error.extensions.code).toBe(OC_BAD_USER_INPUT_ERROR);
      }
    });

    // it('should throw precheck failed error if mars preheck throws error', async () => {
    //   const cardPrecheck = mockMarsApi.cardPrecheck;
    //   mockMarsApi.cardPrecheck = jest.fn().mockRejectedValue(new Error('test'));

    //   try {
    //     await powercardService.powercardVirtualPurchaseCreate(mockInput);
    //   } catch (error) {
    //     expect(error.extensions.code).toBe(
    //       OC_POWERCARD_MARS_PRECHECK_FAILED_ERROR,
    //     );
    //   } finally {
    //     mockMarsApi.cardPrecheck = cardPrecheck;
    //   }
    // });

    it('should throw transaction start failed error if transactionStart throws error', async () => {
      const transactionStart =
        mockTransactionService.daveAndBustersTransactionStartWithPaymentInstrument;
      mockTransactionService.daveAndBustersTransactionStartWithPaymentInstrument = jest
        .fn()
        .mockRejectedValue(new Error('test'));

      try {
        await powercardService.powercardVirtualPurchaseCreate(mockInput);
      } catch (error) {
        expect(error.extensions.code).toBe(
          OC_POWERCARD_TRANSACTION_START_FAILED_ERROR,
        );
      } finally {
        mockTransactionService.daveAndBustersTransactionStartWithPaymentInstrument = transactionStart;
      }
    });

    it('should void the transaction and throw recharge failed error if mars recharge throws error', async () => {
      const cardRecharge = mockMarsApi.cardRecharge;
      mockMarsApi.cardRecharge = jest.fn().mockRejectedValue(new Error('test'));
      const transactionVoidSpy = jest.spyOn(
        mockTransactionService,
        'daveAndBustersTransactionVoid',
      );

      try {
        await powercardService.powercardVirtualPurchaseCreate(mockInput);
      } catch (error) {
        expect(transactionVoidSpy).toHaveBeenCalledWith(
          mockTransaction.uuid,
          expect.anything(),
        );
        expect(error.extensions.code).toBe(
          OC_POWERCARD_MARS_RECHARGE_FAILED_ERROR,
        );
      } finally {
        mockMarsApi.cardRecharge = cardRecharge;
      }
    });

    it('should void the transaction and throw recharge failed error if mars recharge throws error', async () => {
      const cardRecharge = mockMarsApi.cardRecharge;
      mockMarsApi.cardRecharge = jest.fn().mockRejectedValue(new Error('test'));
      const transactionVoidSpy = jest.spyOn(
        mockTransactionService,
        'daveAndBustersTransactionVoid',
      );

      try {
        await powercardService.powercardVirtualPurchaseCreate(mockInput);
      } catch (error) {
        expect(transactionVoidSpy).toHaveBeenCalledWith(
          mockTransaction.uuid,
          expect.anything(),
        );
        expect(error.extensions.code).toBe(
          OC_POWERCARD_MARS_RECHARGE_FAILED_ERROR,
        );
      } finally {
        mockMarsApi.cardRecharge = cardRecharge;
      }
    });
  });
});
