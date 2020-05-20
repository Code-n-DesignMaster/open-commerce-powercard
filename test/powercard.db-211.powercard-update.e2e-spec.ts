import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { assertErrors, assertNoError } from '@open-commerce/test-utils';
import { Connection } from 'typeorm';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import { Powercard } from '@open-commerce/data-objects';
import { get } from 'lodash';
import uuidv4 = require('uuid/v4');

describe('Powercard Update Endpoint (e2e)', () => {
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
  });

  afterAll(async () => {
    await new Promise(resolve => setTimeout(() => resolve(), 500)); // avoid jest open handle error
    await app.close();
  });

  it('can update powercard attributes', async () => {
    const powercardCreateQuery = `
      mutation powercardCreate($input:PowercardCreate!) {
        powercardCreate(input:$input) {
          uuid
          cardNumber
        }
      }
    `;

    const powercardCreateVariables = {
      input: {
        cardNumber: '21386000',
        alias: 'myCard',
        pin: 1264,
        customerUuid: uuidv4(),
      },
    };

    await request(app.getHttpServer())
      .post('/graphql')
      .send({
        operationName: null,
        variables: powercardCreateVariables,
        query: powercardCreateQuery,
      })
      .expect(res => {
        createdPowercard = get(res, 'body.data.powercardCreate');
        expect(createdPowercard.uuid).toBeTruthy();
      });

    const testAlias = 'other fave card';

    const query = `
    mutation {
      powercardUpdate(
        powercardId: "${createdPowercard.uuid}",
        attributes: {
          alias: "${testAlias}"
        }) {
          uuid
          isPhysical
          cardNumber
          cardAlias
          status
          cardType
          imagePack {
            uuid
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
    }
    `;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(res => {
        assertNoError(res);

        const powercard = get(res, 'body.data.powercardUpdate');
        expect(powercard.cardAlias).toBe(testAlias);
        expect(powercard.gameChips).not.toBeNull();
        expect(powercard.rewardChips).not.toBeNull();
        expect(powercard.tickets).not.toBeNull();
        expect(powercard.attractionChips).not.toBeNull();
        expect(powercard.pointsToNextReward).not.toBeNull();
      })
      .expect(200);
  });

  it('returns an error when trying to update a powercard with an id that does not exist', async () => {
    const query = `
        mutation {
          powercardUpdate(
            powercardId: "fake-uuid",
            attributes: {
              alias: "other fave card",
            }) {
              uuid
              isPhysical
              cardNumber
              cardAlias
              status
              cardType
              imagePack {
                uuid
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
        }
      `;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(res => {
        assertErrors(res);
      });
  });
});
