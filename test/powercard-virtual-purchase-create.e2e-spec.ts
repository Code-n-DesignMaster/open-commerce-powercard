import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import {
  assertNoError,
  assertErrors,
  assertErrorCode,
} from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { Connection } from 'typeorm';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import uuidv4 = require('uuid/v4');
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import { PAYMENT_INSTRUMENT_TYPE } from '../src/modules/brand/constants/payment-instrument-type.enum';
import { OC_POWERCARD_CUSTOMER_UPDATE_FAILED_ERROR } from '../src/modules/powercard/errors/powercard-customer-update-failed.error';
import { OC_POWERCARD_CUSTOMER_ALREADY_HAS_VIRTUAL_POWERCARD_ERROR } from '../src/modules/powercard/errors/powercard-virtual-powercard-exists.error';
import { OC_BAD_USER_INPUT_ERROR } from '../src/errors/OCUserInputError';

const attributes = `{
  powercard {
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

describe('Powercard Virtual Purchase Create (e2e)', () => {
  let app: INestApplication;
  let provider: any;
  const customerEmail = 'test@email.com';
  const customerUuid = uuidv4();

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

  it('cannot create a digital powercard with zero dollars paid', async done => {
    const query = `mutation powercardVirtualPurchaseCreate($input: VirtualPowercardCreate) {
      powercardVirtualPurchaseCreate(input: $input)
        ${attributes}
    }`;

    const variables = {
      input: {
        storeId: '81',
        customerUuid,
        rateCardItemIds: [2],
        paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
        paymentInstrumentUuid: uuidv4(),
        nonce: 'fake-valid-visa-nonce',
        alias: 'ryans card',
        country: 'USA',
        dollarsPaid: 0,
        offerId: 1,
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

  it('can create a digital powercard', async done => {
    const query = `mutation powercardVirtualPurchaseCreate($input: VirtualPowercardCreate) {
      powercardVirtualPurchaseCreate(input: $input)
        ${attributes}
    }`;

    const variables = {
      input: {
        storeId: '81',
        customerUuid,
        rateCardItemIds: [2],
        paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
        paymentInstrumentUuid: uuidv4(),
        nonce: 'fake-valid-visa-nonce',
        alias: 'ryans card',
        country: 'USA',
        dollarsPaid: 23.0,
        offerId: 1,
        emailAddress: customerEmail,
        isNewCustomer: false,
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables, query })
      .expect(res => {
        assertNoError(res);

        const powercard =
          res.body.data.powercardVirtualPurchaseCreate.powercard;
        expect(powercard.imagePack).not.toBeNull();
        expect(powercard.cardAlias).toBe('ryans card');
        expect(powercard.isPhysical).toBe(false);
        expect(powercard.cardType).toBe('POWER');
        expect(powercard.status).toBe('OPEN');
        expect(powercard.isRegisteredReward).toBe(false);
        expect(powercard.easyRechargeEnabled).toBe(false);
        expect(powercard.gameChips).toBeGreaterThan(0);
        expect(powercard.pointsToNextReward).toBeGreaterThan(0);
        expect(powercard.rewardPoints).toBe(0);
      })
      .expect(200);

    done();
  });

  it('cannot create additional digital powercards', async done => {
    const query = `mutation powercardVirtualPurchaseCreate($input: VirtualPowercardCreate) {
      powercardVirtualPurchaseCreate(input: $input)
        ${attributes}
    }`;

    const variables = {
      input: {
        storeId: '81',
        customerUuid,
        rateCardItemIds: [2],
        paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
        paymentInstrumentUuid: uuidv4(),
        nonce: 'fake-valid-visa-nonce',
        alias: 'ryans card',
        country: 'USA',
        dollarsPaid: 23.0,
        offerId: 1,
        emailAddress: customerEmail,
        isNewCustomer: false,
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables, query })
      .expect(res => {
        assertErrorCode(
          res,
          OC_POWERCARD_CUSTOMER_ALREADY_HAS_VIRTUAL_POWERCARD_ERROR,
        );
        done();
      });
  });
});
