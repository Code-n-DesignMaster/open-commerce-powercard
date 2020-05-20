import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { assertNoError } from '@open-commerce/test-utils';
import { AppModule } from '../src/modules/app.module';
import { ILocationConnection } from '../src/modules/location/interfaces/location-connection.interface';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import { last } from 'lodash';

const attributes = `{
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
}`;

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

  it('can fetch a list of nearby store locations', async done => {
    const query = `{
      locations(filter:{
        radius:200,
        geoLocationEquals: {
          latitude:33.3790855,
          longitude:-86.80809
        }
      }) ${attributes}
    }`;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
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
        expect(locations.edges[0].node.distance).not.toBeNull();

        const lastItem = last(locations.edges).node;
        const firstItem = locations.edges[0].node;
        expect(lastItem.distance).toBeGreaterThan(firstItem.distance);
      })
      .expect(200);

    done();
  });

  it('not including radius uses default radius value', async done => {
    const query = `{
      locations(filter:{
        geoLocationEquals: {
          latitude:33.3790855,
          longitude:-86.80809
        }
      }) ${attributes}
    }`;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
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
        expect(locations.edges[0].node.distance).not.toBeNull();

        const lastItem = last(locations.edges).node;
        const firstItem = locations.edges[0].node;
        expect(lastItem.distance).toBeGreaterThan(firstItem.distance);
      })
      .expect(200);

    done();
  });
});
