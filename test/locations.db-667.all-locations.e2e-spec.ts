import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { assertNoError } from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { ILocationConnection } from '../src/modules/location/interfaces/location-connection.interface';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';

describe('Get Store Locations Endpoint (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ApolloValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('can fetch a list of all store locations', async done => {
    const query = `{
      locations {
        pageInfo {
          startCursor
          endCursor
        }
        edges {
          cursor
          node {
            brandSpecificLocationId
            address {
              alias
              street1
              street2
              city
              state
              zipCode
              geoLocation {
                latitude
                longitude
              }
            }
            distance
            phoneNumbers {
              phoneType
              phoneNumber
            }
            hoursOfOperationGroup {
              hours {
                genericHoursString
              }
            }
            specialHours
          }
        }
      }
    }`;

    return request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .expect(200)
      .expect(res => {
        assertNoError(res);

        const locations: ILocationConnection = res.body.data.locations;
        expect(locations.edges).toBeTruthy();
        expect(locations.edges.length).toBeGreaterThan(0);
        expect(locations.edges[0].node).toBeTruthy();
        expect(locations.edges[0].node.address).toBeTruthy();
        expect(locations.edges[0].node.address.geoLocation).toBeTruthy();
        expect(locations.edges[0].node.brandSpecificLocationId).toBeTruthy();
        expect(locations.edges[0].node.hoursOfOperationGroup).toBeTruthy();
        expect(
          locations.edges[0].node.hoursOfOperationGroup.hours,
        ).toBeTruthy();
        expect(
          locations.edges[0].node.hoursOfOperationGroup.hours.length,
        ).toBeGreaterThan(0);

        expect(locations.edges[0].node.hoursOfOperationGroup).toBeTruthy();
        expect(locations.edges[0].node.phoneNumbers).toBeTruthy();

        done();
      });
  });
});
