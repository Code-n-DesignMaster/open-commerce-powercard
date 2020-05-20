import { Test, TestingModule } from '@nestjs/testing';
import { LoggerModule } from '../src/modules/logger/logger.module';
import { RedisModule } from '@open-commerce/nestjs-redis';
import { config } from '../src/config/config';
import { CONFIG_TOKEN, ConfigModule } from '@open-commerce/nestjs-config';
import { MarsCachingService } from '../src/modules/mars-caching/mars-caching.service';
const configModule = ConfigModule.forRoot(config);

describe('MARS Caching Service', () => {
  let marsCachingService: MarsCachingService;

  // NOTE: used for a number of tests
  const testPowercardNumber = `${Math.floor(Math.random() * 10000000 + 1)}`;

  const testPowercardUuid = Math.random()
    .toString(36)
    .slice(2);
  const testPowercardUuidB = Math.random()
    .toString(36)
    .slice(2);

  const powercardBalance = {
    StoreID: 54,
    CardNumber: testPowercardNumber,
    Country: 'USA',
    IsRegistered: false,
    Status: 3,
    GameChips: 23.0,
    VideoChips: 20.0,
    RewardChips: 30.0,
    AttractionChips: 40.0,
    Tickets: 50,
    RewardPoints: 60.0,
    PointsToNextReward: 70.0,
    EligibleRewardCount: 80,
  };

  const locations = {
    StoreList: [
      {
        Latitude: 33.3790855,
        State: 'Alabama',
        Zip: '35244',
        City: 'Birmingham',
        StoreName: 'AL, Birmingham',
        SpecialHours: null,
        StoreNumber: 128,
        Hours: ['Sun - Thu 10:00am - Midnight', 'Fri - Sat 10:00am - 2:00am'],
        Phone: '(205) 986-6200',
        Longitude: -86.80809,
        Address: '2700 Riverchase Galleria, Ste 110',
      },
      {
        Latitude: 34.73037,
        State: 'Alabama',
        Zip: '35806',
        City: 'Huntsville',
        StoreName: 'AL, Huntsville',
        SpecialHours: null,
        StoreNumber: 144,
        Hours: ['Sun - Thu 11:00am - Midnight', 'Fri - Sat 11:00am - 2:00am'],
        Phone: null,
        Longitude: -86.5861053,
        Address: '950 Makers Way NW',
      },
      {
        StoreNumber: 81,
        Address: '2525 Rio Grande Blvd',
        City: 'Euless',
        Zip: '76039',
        Longitude: -97.10334,
        StoreName: 'TX, Euless',
        State: 'Texas',
        Latitude: 32.87355,
        SpecialHours: null,
        Phone: '(817) 786-1600',
        Hours: ['Sun - Thu 11:00am - Midnight', 'Fri - Sat 11:00am - 1:00am'],
      },
    ],
  };

  const rateCard = {
    UpSellItemList: [
      {
        CategoryID: 0,
        ItemID: 2,
        Sequence: 0,
        Color: '#41B6E6',
        NumberOfMinutes: 0,
        OriginalPrice: 23,
        UpSellID: 4,
        IsBestValue: true,
        NumberOfChips: 125,
        Price: 23,
      },
      {
        CategoryID: 0,
        ItemID: 4,
        Sequence: 0,
        Color: '#41B6E6',
        NumberOfMinutes: 0,
        OriginalPrice: 29,
        UpSellID: 3,
        IsBestValue: false,
        NumberOfChips: 170,
        Price: 29,
      },
    ],
    Global: {
      AttractionItemList: [
        {
          CategoryID: 0,
          ItemID: 15,
          Sequence: 1,
          Color: '#DC4405',
          NumberOfMinutes: 0,
          OriginalPrice: 6,
          UpSellID: 0,
          IsBestValue: false,
          NumberOfChips: 1,
          Price: 6,
        },
        {
          CategoryID: 0,
          ItemID: 16,
          Sequence: 2,
          Color: '#DC4405',
          NumberOfMinutes: 0,
          OriginalPrice: 12,
          UpSellID: 0,
          IsBestValue: false,
          NumberOfChips: 2,
          Price: 12,
        },
        {
          CategoryID: 0,
          ItemID: 17,
          Sequence: 3,
          Color: '#DC4405',
          NumberOfMinutes: 0,
          OriginalPrice: 18,
          UpSellID: 0,
          IsBestValue: false,
          NumberOfChips: 3,
          Price: 18,
        },
      ],
      ActivationItem: {
        CategoryID: 0,
        ItemID: 8,
        Sequence: 0,
        Color: '#000000',
        NumberOfMinutes: 0,
        OriginalPrice: 3,
        UpSellID: 0,
        IsBestValue: false,
        NumberOfChips: 15,
        Price: 3,
      },
      AttractionPrice: 6,
      ActivationFee: 3,
    },
    Version: 1,
    CategoryList: [
      {
        Sequence: 1,
        Label: 'MEGA VALUE!',
        Color: '#DC4405',
        CategoryId: 3,
      },
    ],
    MenuItemList: [
      {
        CategoryID: 1,
        ItemID: 1,
        Sequence: 1,
        Color: '#41B6E6',
        NumberOfMinutes: 0,
        OriginalPrice: 12,
        UpSellID: 2,
        IsBestValue: false,
        NumberOfChips: 60,
        Price: 12,
      },
      {
        CategoryID: 1,
        ItemID: 2,
        Sequence: 2,
        Color: '#41B6E6',
        NumberOfMinutes: 0,
        OriginalPrice: 23,
        UpSellID: 4,
        IsBestValue: true,
        NumberOfChips: 125,
        Price: 23,
      },
    ],
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        LoggerModule,
        RedisModule.forRootAsync({
          imports: [configModule],
          useFactory: config => config.redis,
          inject: [CONFIG_TOKEN],
        }),
      ],
      providers: [MarsCachingService],
      exports: [MarsCachingService],
    }).compile();

    marsCachingService = module.get<MarsCachingService>(MarsCachingService);
  });

  it('should be defined', () => {
    expect(marsCachingService).toBeDefined();
  });

  it('should mark power card status valid in redis', async () => {
    await marsCachingService.markPowercardValidStatusInCache(
      testPowercardNumber,
      true,
    );
    const powercardIsValid = await marsCachingService.getPowercardValidStatusFromCache(
      testPowercardNumber,
    );
    expect(powercardIsValid).toBe(true);
  });

  it('should mark power card status invalid in redis', async () => {
    await marsCachingService.markPowercardValidStatusInCache(
      testPowercardNumber,
      false,
    );
    const powercardIsValid = await marsCachingService.getPowercardValidStatusFromCache(
      testPowercardNumber,
    );
    expect(powercardIsValid).toBe(false);
  });

  it('should not mark power card status valid in redis if it is null', async () => {
    await marsCachingService.markPowercardValidStatusInCache(null, true);
    const powercardIsValid = await marsCachingService.getPowercardValidStatusFromCache(
      null,
    );
    expect(powercardIsValid).toBe(null);
  });

  it('should store a powercard balance in redis', async () => {
    const stringifiedBalance = JSON.stringify(powercardBalance);
    await marsCachingService.storePowercardBalancesInCache(
      +testPowercardNumber,
      JSON.parse(stringifiedBalance),
    );
    const balanceFromRedis = await marsCachingService.getBalancesInCacheForPowercard(
      +testPowercardNumber,
    );
    Object.keys(balanceFromRedis).forEach(key => {
      if (key !== 'CardNumber') {
        expect(balanceFromRedis[key]).toEqual(powercardBalance[key]);
      }
    });
    expect(balanceFromRedis.CardNumber).toEqual(+powercardBalance.CardNumber);
  });

  it('should store a rate card for a new user in redis', async () => {
    const stringifiedRateCard = JSON.stringify(rateCard);
    await marsCachingService.storeRateCardInCache(
      JSON.parse(stringifiedRateCard),
      true,
      -1,
    );
    const rateCardFromRedis = await marsCachingService.getRateCardInCache(
      true,
      -1,
    );
    expect(JSON.stringify(rateCardFromRedis)).toBe(stringifiedRateCard);
  });

  it('should get a null response when looking up balances for a powercard that is not in redis', async () => {
    const balances = await marsCachingService.getBalancesInCacheForPowercard(
      123,
    );
    expect(balances).toBe(null);
  });

  it('should store locations', async () => {
    const stringifiedLocations = JSON.stringify(locations);
    await marsCachingService.storeLocationsInCache(
      JSON.parse(stringifiedLocations),
    );
    const locationsFromRedis = await marsCachingService.getLocationsInCache();
    expect(JSON.stringify(locationsFromRedis)).toBe(stringifiedLocations);
  });

  it('should properly build a card number valid key', async () => {
    const key = marsCachingService.buildPowercardNumberValidKey(
      testPowercardNumber,
    );
    expect(key).toEqual(`${testPowercardNumber}__POWERCARD_VALID`);
  });

  it('should properly build a power card balance Key', async () => {
    const key = marsCachingService.buildPowercardBalanceKey(
      testPowercardNumber,
    );
    expect(key).toEqual(`${testPowercardNumber}__POWERCARD_BALANCE`);
  });

  it('should properly build a locations key', async () => {
    const key = marsCachingService.buildLocationsKey();
    expect(key).toEqual(`DB__LOCATIONS`);
  });

  it('should properly build a latest new user rate card key', async () => {
    const key = marsCachingService.buildRateCardForNewUserKey(-1, 5);
    expect(key).toEqual(`DB__NEW_USER_RATE_CARD_0_5`);
  });

  it('should properly build a latest existing user rate card key', async () => {
    const key = marsCachingService.buildRateCardForExistingUserKey(-1, 5);
    expect(key).toEqual(`DB__EXISTING_USER_RATE_CARD_0_5`);
  });

  it('should properly build a powercard number lookup key', async () => {
    const key = marsCachingService.buildPowercardNumberLookupKey(
      testPowercardUuid,
    );
    expect(key).toEqual(`${testPowercardUuid}__POWERCARD_NUMBER_LOOKUP`);
  });

  it('should properly build a powercard uuid lookup key', async () => {
    const key = marsCachingService.buildPowercardUuidLookupKey(
      testPowercardNumber,
    );
    expect(key).toEqual(`${testPowercardNumber}__POWERCARD_UUID_LOOKUP`);
  });

  it('should store a powercard number lookup in redis', async () => {
    await marsCachingService.storePowercardNumberLookupInCache(
      testPowercardUuid,
      testPowercardNumber,
    );
    const powercardNumber = await marsCachingService.getPowercardNumberFromPowercardUuidInCache(
      testPowercardUuid,
    );
    expect(powercardNumber).toBe(testPowercardNumber);
  });

  it('should store a powercard uuid lookup in redis', async () => {
    await marsCachingService.storePowercardUuidLookupInCache(
      testPowercardNumber,
      testPowercardUuid,
    );
    await marsCachingService.storePowercardUuidLookupInCache(
      testPowercardNumber,
      testPowercardUuidB,
    );
    const powercardUuids = await marsCachingService.getPowercardUuidsFromPowercardNumberInCache(
      testPowercardNumber,
    );
    expect(powercardUuids.length).toBe(2);
    const foundMatchingUuid =
      powercardUuids[0] === testPowercardUuid ||
      powercardUuids[1] === testPowercardUuid;
    expect(foundMatchingUuid).toBe(true);
  });
});
