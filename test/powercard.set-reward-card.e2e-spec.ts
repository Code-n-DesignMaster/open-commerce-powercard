import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { assertNoError, assertErrors } from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { Connection } from 'typeorm';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import { virtualPowercardCreate, setRewardCard } from './helpers';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import { IPowercard } from '@open-commerce/data-objects';

describe('Powercard Set As Reward Card (using powercardUpdate) (e2e)', () => {
  let app: INestApplication;
  let provider: any;
  const customerEmail = 'test+999@email.com';

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

  it('throws an error when isRegisteredReward is true but email is blank', async done => {
    const createdPowercard = await virtualPowercardCreate(
      app,
      'test+999@email.com',
    );

    const query = `
      mutation powercardUpdate($powercardId: ID!, $customerEmail: OCEmailAddress, $attributes: PowercardAttributesUpdate!) {
        powercardUpdate(powercardId: $powercardId, customerEmail: $customerEmail, attributes: $attributes) {
          uuid
          customerUuid
          cardNumber
          isRegisteredReward
        }
      }`;

    const variables = {
      powercardId: createdPowercard.uuid,
      attributes: {
        alias: 'why is alias required',
        isRegisteredReward: true,
      },
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables, query })
      .expect(200)
      .expect(res => {
        assertErrors(res);
        done();
      });
  });

  it('does not throw when isRegisteredReward is true, email is blank, and card to update is already registered reward', async done => {
    const createdPowercard = await virtualPowercardCreate(app, customerEmail);
    await setRewardCard(app, customerEmail, createdPowercard);

    const query = `
      mutation powercardUpdate($powercardId: ID!, $customerEmail: OCEmailAddress, $attributes: PowercardAttributesUpdate!) {
        powercardUpdate(powercardId: $powercardId, customerEmail: $customerEmail, attributes: $attributes) {
          uuid
          customerUuid
          cardNumber
          isRegisteredReward
        }
      }`;

    const variables = {
      powercardId: createdPowercard.uuid,
      attributes: {
        alias: 'why is alias required',
        isRegisteredReward: true,
      },
    };

    return await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables, query })
      .expect(200)
      .expect(async res => {
        assertNoError(res);
        const updatedCard: IPowercard = res.body.data.powercardUpdate;
        expect(updatedCard.isRegisteredReward).toBe(true);
        const rewardCards = await provider
          .getRepository('Powercard')
          .createQueryBuilder()
          .select()
          .where({
            customerUuid: updatedCard.customerUuid,
            isRegisteredReward: true,
          })
          .getMany();

        expect(rewardCards.length).toBe(1);
        done();
      });
  });

  it('can set a powercard to be the rewards card', async done => {
    const existingRewardsCard = await virtualPowercardCreate(
      app,
      'some_other_email@email.com',
    );

    // Make this the existing rewards card, this should be set to false when we choose a new one
    await setRewardCard(app, customerEmail, existingRewardsCard);
    await virtualPowercardCreate(app, 'yet_another_email@email.com');
    const createdPowercard = await virtualPowercardCreate(app, customerEmail);

    const query = `
      mutation powercardUpdate($powercardId: ID!, $customerEmail: OCEmailAddress, $attributes: PowercardAttributesUpdate!) {
        powercardUpdate(powercardId: $powercardId, customerEmail: $customerEmail, attributes: $attributes) {
          uuid
          customerUuid
          cardNumber
          isRegisteredReward
        }
      }`;

    const variables = {
      powercardId: createdPowercard.uuid,
      customerEmail,
      attributes: {
        alias: 'why is alias required',
        isRegisteredReward: true,
      },
    };

    return await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables, query })
      .expect(200)
      .expect(async res => {
        assertNoError(res);
        const updatedCard: IPowercard = res.body.data.powercardUpdate;
        expect(updatedCard.isRegisteredReward).toBe(true);
        const rewardCards = await provider
          .getRepository('Powercard')
          .createQueryBuilder()
          .select()
          .where({
            customerUuid: updatedCard.customerUuid,
            isRegisteredReward: true,
          })
          .getMany();

        expect(rewardCards.length).toBe(1);
        done();
      });
  });
});
