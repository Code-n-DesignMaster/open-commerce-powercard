import { INestApplication } from '@nestjs/common/interfaces';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { assertNoError } from '@open-commerce/test-utils';
import { Connection } from 'typeorm';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';

describe('Get Brand Endpoint (e2e)', () => {
  let provider: any;
  let app: INestApplication;
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
    await provider.close();
  });

  it('can query a Brand', async done => {
    const query = `
    query {
      brand{
        tenant{
          name
        }
        name
        agreements{
          url
          name
        }
        preferences{
          name
          description
        }
        supportedPaymentTypes
      }
    }
    `;

    const response = {
      data: {
        brand: {
          agreements: [
            {
              name: 'Privacy Policy',
              url: 'https://www.daveandbusters.com/privacy-policy',
            },
            {
              name: 'Terms and Conditions',
              url: 'https://www.daveandbusters.com/downloadfunTC',
            },
          ],
          name: "Dave & Buster's",
          preferences: [
            {
              description:
                'Allow user to be verified via the biometric scanning sensor of device',
              name: 'Biometric',
            },
            {
              description: 'User opts in to receive marketing emails',
              name: 'Market Opt In',
            },
          ],
          supportedPaymentTypes: [
            'APPLE_PAY',
            'GOOGLE_PAY',
            'GOOGLE_WALLET',
            'AMERICAN_EXPRESS',
            'DISCOVER',
            'MASTERCARD',
            'VISA',
            'MAESTRO',
          ],
          tenant: {
            name: "Dave & Buster's",
          },
        },
      },
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(res => {
        assertNoError(res);
        expect(res.body).toMatchObject(response);
        done();
      });
  });
});
