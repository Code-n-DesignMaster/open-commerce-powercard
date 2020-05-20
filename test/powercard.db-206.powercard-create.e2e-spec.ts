import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { powercardFragmentAttributes, buildSelectSetString } from './helpers';
import { assertErrors, assertNoError } from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { Connection } from 'typeorm';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import uuidv4 = require('uuid/v4');

const powercardSelectSetString = buildSelectSetString(
  powercardFragmentAttributes,
);

describe('Powercard Create Endpoint (e2e)', () => {
  let app: INestApplication;
  let provider: any;

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

  it('cannot add an incorrectly formatted powercard DB-206', async done => {
    const query = `mutation powercardCreate($powercardCreate: PowercardCreate) {
      powercardCreate(input: $powercardCreate) {
        ${powercardSelectSetString}
      }
    }
    `;

    // #### THIS SHOULD BE A STRING
    const variables = {
      powercardCreate: {
        cardEncoding: 'rzd768dfiuusfy',
        cardNumber: 7777,
        alias: 'fave card',
        rfidData: 'zxlkjlkdjflskjfl',
        image: {
          url: 'http://some-image',
          name: 'png',
        },
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: 'powercardCreate', variables, query })
      .expect(res => {
        assertErrors(res);
      })
      .expect(400);

    done();
  });

  it('can add a powercard to the wallet of a user', async done => {
    // TODO: NOTE: This is the only combination of powercard / pin that work in MARS for testing
    // at the time of the writing of this code (4/23/2019)
    const cardNumber = 26312001;
    const pin = 6752;

    const query = `mutation {
      powercardCreate(input: {
        cardNumber: "${cardNumber}",
        customerUuid: "${uuidv4()}",
        alias: "fave card",
        easyRechargeEnabled: false,
        pin: ${pin},
      }) {
        ${powercardSelectSetString}
      }
    }
    `;

    const expectedResponse: object = {
      data: {
        powercardCreate: {
          cardNumber: `${cardNumber}`,
          status: 'OPEN',
          cardType: 'POWER',
          cardAlias: 'fave card',
        },
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(res => {
        assertNoError(res);
        expect(res.body).toMatchObject(expectedResponse);
      })
      .expect(200);

    done();
  });
});
