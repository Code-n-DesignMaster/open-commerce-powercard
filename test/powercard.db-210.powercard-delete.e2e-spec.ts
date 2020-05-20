import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import { seedEntity, removeSeedEntity } from './helpers';
import { AppModule } from '../src/modules/app.module';
import { Connection } from 'typeorm';
import { assertNoError, assertErrors } from '@open-commerce/test-utils';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import {
  Powercard,
  POWERCARD_STATUS_TYPE,
  POWERCARD_CARD_TYPE,
} from '@open-commerce/data-objects';

describe('Powercard Delete Endpoint (e2e)', () => {
  let provider: any;
  let app: INestApplication;
  let createdPowercard: Powercard;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    provider = moduleFixture.get<Connection>(DB_CONNECTION_TOKEN);

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ApolloValidationPipe());
    await app.init();

    createdPowercard = (await seedEntity(provider, 'Powercard', {
      uuid: undefined,
      isPhysical: true,
      cardNumber: '7777',
      cardAlias: 'fave card',
      status: POWERCARD_STATUS_TYPE.OPEN,
      cardType: POWERCARD_CARD_TYPE.POWER,
      image: {
        id: undefined,
        imageType: 'png',
        url: 'http://some-image',
      },
    })) as Powercard;
  });

  afterAll(async () => {
    await removeSeedEntity(provider, 'Powercard', createdPowercard);
    await provider.close();
  });

  it('can delete a powercard', async done => {
    const query = `mutation {
      powercardDelete(powercardId:"${createdPowercard.uuid}")
      {
        success
        status
      }
    }`;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(200)
      .expect(res => assertNoError(res))
      .expect(res => {
        expect(res.body.data.powercardDelete.success).toBeTruthy();
        done();
      });
  });

  it('returns an error when trying to remove a powercard with an id that does not exist', async done => {
    const query = `mutation {
     powercardDelete(powercardId:"fake-uuid")
     {
       success
       status
     }
   }`;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(res => {
        assertErrors(res);
        done();
      });
  });
});
