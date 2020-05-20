import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { assertNoError, assertErrors } from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { Connection } from 'typeorm';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import uuidv4 = require('uuid/v4');
import { virtualPowercardCreate, createPaymentInstrument } from './helpers';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import { PAYMENT_INSTRUMENT_TYPE } from '@open-commerce/data-objects';

const attributes = `{
  powercard {
    uuid
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
  }
}`;

describe('Powercard Funds Add Endpoint (e2e)', () => {
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

  it('cannot add funds to a non-existant powercard', async done => {
    const query = `mutation powercardFundsAdd($input: PowercardFundsAdd) {
      powercardFundsAdd(input: $input)
        ${attributes}
    }`;

    const paymentInstrumentUuid = await createPaymentInstrument();

    const variables = {
      input: {
        uuid: 'jkfdhskjfhdskjfhkdsjh',
        customerUuid: uuidv4(),
        storeId: 81,
        rateCardItemIds: [7],
        paymentInstrumentUuid,
        paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
        country: 'USA',
        dollarsPaid: 10.0,
        emailAddress: customerEmail,
        isNewCustomer: false,
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables, query })
      .expect(res => {
        assertErrors(res);
      })
      .expect(200);

    done();
  });

  it('can add funds to an existing powercard', async done => {
    const createdPowercard = await virtualPowercardCreate(app, customerEmail);

    const paymentInstrumentUuid = await createPaymentInstrument();

    const query = `mutation powercardFundsAdd($input: PowercardFundsAdd) {
      powercardFundsAdd(input: $input)
        ${attributes}
    }`;

    const variables = {
      input: {
        uuid: createdPowercard.uuid,
        storeId: 81,
        rateCardItemIds: [7],
        customerUuid: uuidv4(),
        paymentInstrumentUuid,
        paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
        country: 'USA',
        dollarsPaid: 100.0,
        emailAddress: customerEmail,
        isNewCustomer: false,
      },
    };

    const expectedResponse: object = {
      data: {
        powercardFundsAdd: {
          powercard: {
            uuid: createdPowercard.uuid,
            cardNumber: createdPowercard.cardNumber,
            attractionChips: 0,
            cardAlias: 'ryans card',
            cardType: 'POWER',
            easyRechargeEnabled: false,
            isPhysical: false,
            isRegisteredReward: false,
            rewardChips: 0,
            status: 'OPEN',
            tickets: 0,
            videoChips: 0,
          },
        },
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables, query })
      .expect(res => {
        assertNoError(res);
        expect(res.body).toMatchObject(expectedResponse);
        const powercard = res.body.data.powercardFundsAdd.powercard;
        expect(powercard.gameChips).toBeGreaterThan(0);
        expect(powercard.pointsToNextReward).toBeGreaterThan(0);
        expect(powercard.rewardPoints).toBeGreaterThan(0);
      })
      .expect(200);

    done();
  });
});
