import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { virtualPowercardCreate } from './helpers';
import { assertNoError, assertErrors } from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { get } from 'lodash';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import { IPowercard, POWERCARD_STATUS_TYPE } from '@open-commerce/data-objects';

describe('Powercard Enable / Disable Endpoint (e2e)', () => {
  let app: INestApplication;
  let createdPowercard: IPowercard;
  const customerEmail = 'test@email.com';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ApolloValidationPipe());
    await app.init();

    createdPowercard = await virtualPowercardCreate(app, customerEmail);
  });

  afterAll(async () => {
    await app.close();
  });

  it('cannot disable a non-existent powercard', async done => {
    const status = POWERCARD_STATUS_TYPE.STOLEN;

    const query = `mutation {
      powercardDisable(
        id: "fake-uuid",
        reason: ${status}
      ) {
        uuid
        cardNumber
        status
      }
    }`;

    return await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(200)
      .expect(res => {
        assertErrors(res);
        done();
      });
  });

  it('can disable a powercard', async done => {
    const status = POWERCARD_STATUS_TYPE.STOLEN;

    const query = `mutation {
      powercardDisable(
        id: "${createdPowercard.uuid}",
        reason: ${status}
      ) {
        uuid
        cardNumber
        status
      }
    }`;

    return await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(200)
      .expect(res => {
        assertNoError(res);
        const powercard = get(res, 'body.data.powercardDisable');
        expect(powercard).toBeTruthy();
        expect(powercard.uuid).toBe(createdPowercard.uuid);
        expect(powercard.cardNumber).toBe(createdPowercard.cardNumber);
        expect(powercard.status).toBe(status);
        done();
      });
  });

  it('cannot enable a non-existent powercard', async done => {
    const status = POWERCARD_STATUS_TYPE.STOLEN;

    const query = `mutation {
      powercardEnable(
        id: "fake-uuid",
      ) {
        uuid
        cardNumber
        status
      }
    }`;

    return await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(200)
      .expect(res => {
        assertErrors(res);
        done();
      });
  });
  it('can enable a powercard', async done => {
    const query = `mutation {
      powercardEnable(id: "${createdPowercard.uuid}") {
        uuid
        cardNumber
        status
      }
    }`;

    return await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(200)
      .expect(res => {
        assertNoError(res);

        const powercard = get(res, 'body.data.powercardEnable');
        expect(powercard).toBeTruthy();
        expect(powercard.uuid).toBe(createdPowercard.uuid);
        expect(powercard.cardNumber).toBe(createdPowercard.cardNumber);
        expect(powercard.status).toBe(POWERCARD_STATUS_TYPE.OPEN);
        done();
      });
  });
});
