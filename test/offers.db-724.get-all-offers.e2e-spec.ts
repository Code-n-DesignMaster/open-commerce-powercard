import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { assertNoError } from '@open-commerce/test-utils';
import { IPowercardOffer } from '../src/modules/mars/interfaces/IPowercardOffer';
import { IRateCardItem } from '@open-commerce/data-objects';

const X_API_KEY = 'S2SI5501q3SeKQR3ZLqpxcrVPuHUAxV0jCPCN8em8QRGoQyt';

describe('Dave Busters Offer List GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => await app.close());

  it('can get offer list data', async done => {
    const query = `{
      offerList(input:{
        storeId:81,
        emailAddress: "some_wonky_email@some_provider.com",
      }) {
        activationFee
        activationItem {
          itemId
          categoryId
          chips
          price
          originalPrice
          sequence
          isBestValue
          upSellId
          color
        }
        offerList {
          item {
            itemId
            categoryId
            chips
            price
            originalPrice
            sequence
            isBestValue
            upSellId
            color
          }
          offerId
          title
          description
          offerAmount
          imageUrl
          validFrom
          validTo
          disclaimer
          termsAndConditions
          autoApply
        }
      }
    }`;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .set('x-api-key', X_API_KEY)
      .expect(res => {
        assertNoError(res);
        const {
          offerList,
          activationFee,
          activationItem,
        } = res.body.data.offerList;
        // const offerList: IPowercardOffer[] = res.body.data.offerList;
        expect(offerList).toBeTruthy();
        expect(offerList.length).toBeGreaterThan(0);
        const offerListItem = offerList[0];
        expect(offerListItem.autoApply).not.toBeNull();
        expect(offerListItem.description).toBeTruthy();
        expect(offerListItem.disclaimer).toBeTruthy();
        expect(offerListItem.offerId).toBeGreaterThan(0);
        expect(offerListItem.offerAmount).toBeGreaterThan(0);
        expect(offerListItem.termsAndConditions).toBeTruthy();
        expect(offerListItem.title).toBeTruthy();
        expect(offerListItem.validFrom).toBeTruthy();
        expect(offerListItem.validTo).toBeTruthy();
        const offerListItemItem = offerListItem.item;
        expect(offerListItemItem).toBeTruthy();
        expectItemAttributes(offerListItemItem);
        expect(activationFee).toBeTruthy();
        expect(activationItem).toBeTruthy();
      })
      .expect(200);
    done();
  });
});

const expectItemAttributes = (item: IRateCardItem) => {
  expect(item).toBeTruthy();
  expect(item.categoryId).toBeGreaterThan(-1);
  expect(item.chips).toBeGreaterThan(-1);
  expect(item.color).toBeTruthy();
  expect(item.isBestValue).not.toBeNull();
  expect(item.itemId).toBeGreaterThan(-1);
  expect(item.originalPrice).toBeGreaterThan(-1);
  expect(item.price).toBeGreaterThan(-1);
  expect(item.sequence).toBeGreaterThan(-1);
  expect(item.upSellId).toBeGreaterThan(-1);
};
