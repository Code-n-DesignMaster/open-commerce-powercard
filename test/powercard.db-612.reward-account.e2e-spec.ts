import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { assertNoError, assertErrorCode } from '@open-commerce/test-utils';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import { OC_POWERCARD_REWARD_MEMBER_CREATE_FAILED_ERROR } from '../src/modules/powercard/errors/powercard-reward-member-create-failed.error';
import { OC_POWERCARD_REWARD_MEMBER_UPDATE_FAILED_ERROR } from '../src/modules/powercard/errors/powercard-reward-member-update-failed.error';
import { OC_POWERCARD_REWARD_EMAIL_UPDATE_FAILED_ERROR } from '../src/modules/powercard/errors/powercard-reward-email-update-failed.error';

describe('Reward Account Spec (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;
  const email = `test${new Date().getTime()}@email.com`;

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ApolloValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Add Reward Member', () => {
    it('can add a new reward member', async done => {
      const query = `mutation func($input: RewardAccountInput!) {
        rewardAccountCreate(input: $input)
      }`;

      const variables = {
        input: {
          emailAddress: email,
          phoneNumber: '+17895551234',
          firstName: 'first',
          lastName: 'last',
          zipCode: '12345',
          preferredLocation: 5,
          optIn: true,
          birthDate: '12/14/1977',
        },
      };

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ operationName: null, variables, query })
        .expect(res => assertNoError(res))
        .expect(res => {
          expect(res.body.data.rewardAccountCreate).toBe(true);
        })
        .expect(200);

      done();
    });

    it('throws an error if add reward member request is malformed', async done => {
      const query = `mutation func($input: RewardAccountInput!) {
        rewardAccountCreate(input: $input)
      }`;

      const variables = {
        input: {
          emailAddress: `another${email}`,
        },
      };

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ operationName: null, variables, query })
        .expect(res => {
          assertErrorCode(res, OC_POWERCARD_REWARD_MEMBER_CREATE_FAILED_ERROR);
          done();
        });
    });
  });

  describe('Update Reward Member', async () => {
    it('can add a new reward member', async done => {
      const query = `mutation func($input: RewardAccountInput!) {
        rewardAccountUpdate(input: $input)
      }`;

      const variables = {
        input: {
          emailAddress: email,
          phoneNumber: '+17895551234',
          firstName: 'first',
          lastName: 'newLast',
          zipCode: '12345',
          preferredLocation: 5,
          optIn: true,
          birthDate: '12/14/1977',
        },
      };

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ operationName: null, variables, query })
        .expect(res => assertNoError(res))
        .expect(res => {
          expect(res.body.data.rewardAccountUpdate).toBe(true);
        })
        .expect(200);

      done();
    });

    it('throws an error if add reward member request is malformed', async done => {
      const query = `mutation func($input: RewardAccountInput!) {
        rewardAccountUpdate(input: $input)
      }`;

      const variables = {
        input: {
          emailAddress: `another${email}`,
        },
      };

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ operationName: null, variables, query })
        .expect(res => {
          assertErrorCode(res, OC_POWERCARD_REWARD_MEMBER_UPDATE_FAILED_ERROR);
          done();
        });
    });
  });

  describe('Update Reward Email', () => {
    it('can update the reward email address', async done => {
      const query = `mutation {
        rewardEmailUpdate(
          oldEmailAddress:"${email}",
          newEmailAddress:"new${email}",
        )
      }`;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ operationName: null, variables: {}, query })
        .expect(res => assertNoError(res))
        .expect(res => {
          expect(res.body.data.rewardEmailUpdate).toBe(true);
        })
        .expect(200);

      done();
    });

    it('throws error if email was not found', async done => {
      const query = `mutation {
        rewardEmailUpdate(
          oldEmailAddress:"invalid${email}",
          newEmailAddress:"new${email}",
        )
      }`;

      await request(app.getHttpServer())
        .post('/graphql')
        .send({ operationName: null, variables: {}, query })
        .expect(res => {
          assertErrorCode(res, OC_POWERCARD_REWARD_EMAIL_UPDATE_FAILED_ERROR);
          done();
        });
    });
  });
});
