import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { assertNoError } from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { Connection } from 'typeorm';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import uuidv4 = require('uuid/v4');
import {
  virtualPowercardCreate,
  setRewardCard,
  addFundsToPowercard,
} from './helpers';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';

describe('Powercard Reward History Endpoint (e2e)', () => {
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

  it('can get reward history for a user', async done => {
    const createdPowercard = await virtualPowercardCreate(app, customerEmail);

    await setRewardCard(app, customerEmail, createdPowercard);
    await addFundsToPowercard(app, customerEmail, createdPowercard);

    const query = `query rewardHistory($emailAddress: OCEmailAddress!) {
      rewardHistory(emailAddress: $emailAddress) {
        rewardPoints
        pointsToNextReward
        eligibleRewardCount
        lastUpdated
        transactions {
          transactionType
          transactionDate
          numberOfPoints
          numberOfChips
          chipBalance
          expirationDate
        }
      }
    }`;

    const variables = {
      emailAddress: customerEmail,
    };

    return await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables, query })
      .expect(res => {
        assertNoError(res);
        const history = res.body.data.rewardHistory;
        expect(history.rewardPoints).toBeGreaterThan(-1);
        expect(history.pointsToNextReward).toBeGreaterThan(-1);
        expect(history.eligibleRewardCount).toBeGreaterThan(-1);
        expect(history.lastUpdated).toBeTruthy();
        expect(history.transactions).toBeTruthy();
        expect(history.transactions.length).toBeGreaterThan(0);
        const transaction = history.transactions[0];
        expect(transaction.transactionType).toBe(1);
        expect(transaction.transactionDate).toBeTruthy();
        expect(transaction.numberOfPoints).toBeGreaterThan(-1);
        expect(transaction.chipBalance).toBeGreaterThan(0);
        done();
      });
  });
});
