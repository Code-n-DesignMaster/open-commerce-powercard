import { INestApplication } from '@nestjs/common/interfaces';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/modules/app.module';
import { assertNoError } from '@open-commerce/test-utils';
import { ApolloValidationPipe } from '../src/apollo-validation-pipe';
import {
  IRateCard,
  IRateCardItem,
  IRateCardCategory,
} from '@open-commerce/data-objects';

const X_API_KEY = 'S2SI5501q3SeKQR3ZLqpxcrVPuHUAxV0jCPCN8em8QRGoQyt';

describe('Dave Busters Rate Card GraphQL (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ApolloValidationPipe());
    await app.init();
  });

  afterAll(async () => await app.close());

  it('can get rate card data', async done => {
    const query = `{
      getRateCards(input:{
        storeId:81,
        epicenter:{
          latitude:23,
          longitude:34,
        },
        radius:23.4,
        simpleClosest:true
      }) {
        attractionPrice
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
        attractionItemList {
          itemId
          categoryId
          chips
          originalPrice
          price
          sequence
          isBestValue
          upSellId
          color
        }
        activationFee
        activationItem {
          itemId
          categoryId
          chips
          originalPrice
          price
          sequence
          isBestValue
          upSellId
          color
        }
        categoryList {
          categoryId
          label
          sequence
          color
        }
        menuItemList {
          itemId
          categoryId
          chips
          originalPrice
          price
          sequence
          isBestValue
          upSellId
          color
        }
        upSellItemList {
          itemId
          categoryId
          chips
          originalPrice
          price
          sequence
          isBestValue
          upSellId
          color
        }
      }
    }`;

    await request(app.getHttpServer())
      .post('/graphql')
      .send({ operationName: null, variables: {}, query })
      .set('x-api-key', X_API_KEY)
      .expect(res => {
        assertNoError(res);
        const rateCard: IRateCard = res.body.data.getRateCards;
        expect(rateCard.activationFee).toBeGreaterThan(-1);
        expect(rateCard.attractionPrice).toBeGreaterThan(-1);
        const item = rateCard.activationItem;
        expectItemAttributes(item);
        const categoryList = rateCard.categoryList;
        expect(categoryList).toBeTruthy();
        expect(categoryList.length).toBeGreaterThan(0);
        expectCategoryItemAttributes(categoryList[0]);
        const attractionItemList = rateCard.attractionItemList;
        expectItemListAttributes(attractionItemList);
        const menuItemList = rateCard.menuItemList;
        expectItemListAttributes(menuItemList);
        const upSellItemList = rateCard.upSellItemList;
        expectItemListAttributes(upSellItemList);
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

const expectCategoryItemAttributes = (item: IRateCardCategory) => {
  expect(item).toBeTruthy();
  expect(item.categoryId).toBeGreaterThan(-1);
  expect(item.color).toBeTruthy();
  expect(item.label).toBeTruthy();
  expect(item.sequence).toBeGreaterThan(-1);
};

const expectItemListAttributes = (list: IRateCardItem[]) => {
  expect(list).toBeTruthy();
  expect(list.length).toBeGreaterThan(0);
  expectItemAttributes(list[0]);
};
