import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { assertNoError } from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { Connection } from 'typeorm';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import uuidv4 = require('uuid/v4');
import { virtualPowercardCreate, addFundsToPowercard } from './helpers';
import { times, find } from 'lodash';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import { IPowercard } from '@open-commerce/data-objects';

const attributes = `{
  cardNumber
  status
  cardType
  cardAlias
  imagePack {
    name
    fullsizeImages {
      url
      width
      height
    }
    thumbnailImages {
      url
      width
      height
    }
  }
  isPhysical
  gameChips
  videoChips
  rewardChips
  attractionChips
  tickets
  rewardPoints
  pointsToNextReward
  isRegisteredReward
  easyRechargeEnabled
}`;

// NOTE: this data is based on rate card version 4
const RATE_CARD_DATA = [
  {
    itemId: 2,
    chips: 125,
    price: 23,
  },
  {
    itemId: 3,
    chips: 250,
    price: 40,
  },
];

describe('Get Powercards Endpoint (e2e)', () => {
  let app: INestApplication;
  let provider: any;
  const customerEmail = 'test@email.com';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ApolloValidationPipe());
    provider = moduleFixture.get<Connection>(DB_CONNECTION_TOKEN);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await provider.close();
  });

  // it('can get a single powercard', async done => {
  //   const createdPowercard = await virtualPowercardCreate(app, customerEmail);
  // });

  it('can get a user\'s powercards', async done => {
    const createdPowercard1 = await virtualPowercardCreate(app, customerEmail); // will have 60 chips
    const createdPowercard2 = await virtualPowercardCreate(app, customerEmail);
    const createdPowercard3 = await virtualPowercardCreate(app, customerEmail);

    let rateCardItem = RATE_CARD_DATA[0];
    await addFundsToPowercard(
      app,
      customerEmail,
      createdPowercard2,
      rateCardItem.itemId,
      rateCardItem.price,
    ); // will have 120 chips

    rateCardItem = RATE_CARD_DATA[1];
    await addFundsToPowercard(
      app,
      customerEmail,
      createdPowercard3,
      rateCardItem.itemId,
      rateCardItem.price,
    ); // will have 310 chips

    const query = `query powercards($customerUuid: String) {
      powercards(customerUuid: $customerUuid)
        ${attributes}
    }`;

    const variables = {
      customerUuid: uuidv4(),
    };

    await times(4, async () => {
      await request(app.getHttpServer())
        .post('/graphql')
        .send({ operationName: null, variables, query })
        .expect(res => {
          assertNoError(res);
          const powercards = res.body.data.powercards;

          const powercard1 = find<IPowercard>(powercards, {
            cardNumber: createdPowercard1.cardNumber,
          });
          const powercard2 = find<IPowercard>(powercards, {
            cardNumber: createdPowercard2.cardNumber,
          });
          const powercard3 = find<IPowercard>(powercards, {
            cardNumber: createdPowercard3.cardNumber,
          });

          // const [powercard1, powercard2, powercard3] = powercards;
          // const [powercard2] = powercards;
          expectPowercard(powercard1);
          expectPowercard(powercard2);
          expectPowercard(powercard3);

          expect(powercard1.gameChips).toBe(60);
          expect(powercard2.gameChips).toBe(120);
          expect(powercard3.gameChips).toBe(310);
        })
        .expect(200);
    });
    done();
  });
});

const expectPowercard = powercard => {
  expect(powercard.imagePack).not.toBeNull();
  expect(powercard.cardAlias).toBeTruthy();
  expect(powercard.isPhysical).toBe(false);
  expect(powercard.cardType).toBe('POWER');
  expect(powercard.status).toBe('OPEN');
  expect(powercard.isRegisteredReward).not.toBeNull();
  expect(powercard.easyRechargeEnabled).toBe(false);
  expect(powercard.gameChips).toBeGreaterThan(0);
  expect(powercard.pointsToNextReward).toBeGreaterThan(0);
};
