/* tslint:disable */

import { get } from 'lodash';
import { INestApplication } from '@nestjs/common';
import uuidv4 = require('uuid/v4');
import { assertNoError } from '@open-commerce/test-utils';
import * as request from 'supertest';
import { MarsService } from '../src/modules/mars/mars.service';
import { MARS_API_TOKEN } from '../src/modules/mars/mars.constants';
import { RewardsAddMemberRequestDto } from '../src/modules/mars/dto/RewardsAddMemberRequest.dto';
import { PaymentServiceGraphqlClient } from '@open-commerce/internal-services-api';
import { PAYMENT_INSTRUMENT_TYPE } from '../src/modules/brand/constants/payment-instrument-type.enum';
import { IPowercard } from '@open-commerce/data-objects';
import { PassManagementServiceGraphqlClient } from '@open-commerce/internal-services-api';
const mobilePassService = new PassManagementServiceGraphqlClient();

// These paths are slightly different since this is the `test` folder
export const testEntitiesPattern = __dirname + '/../src/**/*.entity{.ts,.js}';
export const testMigrationsPattern =
  __dirname + '/../src/migrations/*{.ts,.js}';

export const formatResponse = response => {
  return JSON.stringify(JSON.parse(response)) + '\n';
};

export const errorMessageFrom = res => get(res, 'body.errors.0.message');

export const seedEntity = async (
  provider: any,
  typeName: string,
  entity: any,
): Promise<any> => {
  return provider.getRepository(typeName).save(entity);
};

export const removeSeedEntity = async (
  provider: any,
  typeName: string,
  entity: any,
): Promise<any> => {
  return provider.getRepository(typeName).delete(entity.id);
};

export const buildSelectSetString = (setArr: any[]) => {
  let retVal = '';

  setArr.forEach((attr: string | object) => {
    if (typeof attr === 'string') {
      retVal += `\n${attr}`;
    } else if (typeof attr === 'object') {
      retVal += `\n${attr['key']} {
        ${buildSelectSetString(attr['values'])}
      }`;
    }
  });
  return retVal;
};

export const powercardFragmentAttributes = [
  'uuid',
  'cardNumber',
  'cardAlias',
  'status',
  'cardType',
  { key: 'imagePack', values: ['name', 'uuid'] },
];

export const createPaymentInstrument = async (
  nonce: string = 'fake-valid-visa-nonce',
) => {
  const result = await new PaymentServiceGraphqlClient().braintreePaymentInstrumentCreateFromPaymentTokenAndAddToWallet(
    uuidv4(),
    nonce,
    '12345',
  );

  if (!result.data) {
    throw new Error('Failed to create payment instrument!');
  }

  return result.data.uuid;
};

export const virtualPowercardCreate = async (
  app: INestApplication,
  customerEmail: string,
) => {
  const paymentInstrumentUuid = await createPaymentInstrument();

  const powercardCreateQuery = `
      mutation virtualCreate($input: VirtualPowercardCreate!) {
        powercardVirtualPurchaseCreate(input: $input) {
          powercard {
            uuid
            customerUuid
            cardNumber
          }
        }
      }`;

  const variables = {
    input: {
      storeId: 81,
      customerUuid: uuidv4(),
      rateCardItemIds: [2],
      paymentInstrumentUuid,
      paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
      alias: 'ryans card',
      country: 'USA',
      dollarsPaid: 23.0,
      offerId: 1,
      emailAddress: customerEmail,
      isNewCustomer: false,
    },
  };

  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      operationName: null,
      variables,
      query: powercardCreateQuery,
    })
    .expect(res => assertNoError(res))
    .expect(200);

  const powercard = get(
    response,
    'body.data.powercardVirtualPurchaseCreate.powercard',
  ) as IPowercard;

  const walletPassResponse = await mobilePassService.getWalletPassUrls(
    powercard.uuid,
  );

  try {
    await request(app.getHttpServer()).get(walletPassResponse.data.pkPassUrl);
  } catch (error) {
    console.warn(error);
  }

  return powercard;
};

export const updatePowercard = async (
  app: INestApplication,
  powercardId: string,
  customerEmail: string,
  powercard: IPowercard,
) => {
  // This ignores imagePack
  const { cardAlias, isRegisteredReward, easyRechargeEnabled } = powercard;

  const powercardUpdateQuery = `
      mutation powercardUpdate($powercardId: ID!, $customerEmail: OCEmailAddress, $attributes: PowercardAttributesUpdate!) {
        powercardUpdate(powercardId: $powercardId, customerEmail: $customerEmail, attributes: $attributes) {
          uuid
          cardNumber
          isRegisteredReward
        }
      }`;

  const variables = {
    powercardId,
    customerEmail,
    attributes: {
      alias: cardAlias,
      isRegisteredReward,
      easyRechargeEnabled,
    },
  };

  const response = await request(app.getHttpServer())
    .post('/graphql')
    .send({
      operationName: null,
      variables,
      query: powercardUpdateQuery,
    })
    .expect(res => assertNoError(res))
    .expect(200);

  return get(response, 'body.data.powercardUpdate') as IPowercard;
};

export const setRewardCard = async (
  app: INestApplication,
  customerEmail: string,
  powercard: IPowercard,
) => {
  powercard.isRegisteredReward = true;
  const marsService = app.get<MarsService>(MARS_API_TOKEN);

  // register with MARS
  await marsService.refreshToken();
  try {
    await marsService.rewardsAddMember({
      emailAddress: customerEmail,
      birthDate: '01/06/1960',
      preferredLocation: 29,
      phoneNumber: '2148675309',
      optIn: true,
    } as RewardsAddMemberRequestDto);
  } catch (error) {
    if (error.message !== 'Email Address Already Registered') {
      throw error;
    }
  }

  // Make this the existing rewards card, this should be set to false when we choose a new one
  return await updatePowercard(app, powercard.uuid, customerEmail, powercard);
};

export const addFundsToPowercard = async (
  app: INestApplication,
  customerEmail: string,
  powercard: IPowercard,
  itemId = 2,
  price = 23,
) => {
  const query = `mutation fundsAdd($input: PowercardFundsAdd!) {
      powercardFundsAdd(input: $input) {
        uuid
      }
    }`;

  const variables = {
    input: {
      uuid: powercard.uuid,
      storeId: 81,
      customerUuid: uuidv4(),
      rateCardItemIds: [itemId],
      paymentInstrumentUuid: uuidv4(),
      paymentInstrumentType: PAYMENT_INSTRUMENT_TYPE.VISA,
      nonce: 'fake-valid-nonce',
      country: 'USA',
      dollarsPaid: price,
      emailAddress: customerEmail,
      isNewCustomer: false,
    },
  };

  await request(app.getHttpServer())
    .post('/graphql')
    .send({ operationName: null, variables, query })
    .expect(res => {
      assertNoError(res);
    })
    .expect(200);
};
