import { TRANSACTION_REPOSITORY_TOKEN } from '../constants/powercard.constants';
import { Test } from '@nestjs/testing';
import { mockReceipt } from './__mocks__/mock-receipt';
import { ReceiptEmailBuilder } from '../receipt-email-builder';
import {
  ReceiptLineItem,
  CHECK_LINE_ITEM_TYPE,
  TRANSACTION_STATUS,
  Transaction,
} from '@open-commerce/data-objects';
import { POWERCARD_SERVICE_CONFIG } from '../../../config/config.constants';

describe('ReceiptEmailBuilder', () => {
  let receiptEmailBuilder: ReceiptEmailBuilder;
  let generatedEmail: string;

  const currency = 'USD';
  const locale = 'en-US';

  const mockTender: ReceiptLineItem = mockReceipt.lineItems.find(
    item => item.itemType === CHECK_LINE_ITEM_TYPE.TENDER,
  );
  const mockTip: ReceiptLineItem = mockReceipt.lineItems.find(
    item => item.itemType === CHECK_LINE_ITEM_TYPE.TIP,
  );
  const mockMenuItem: ReceiptLineItem = mockReceipt.lineItems.find(
    item => item.itemType === CHECK_LINE_ITEM_TYPE.MENU_ITEM,
  );
  const mockReference: ReceiptLineItem = mockReceipt.lineItems.find(
    item => item.itemType === CHECK_LINE_ITEM_TYPE.REFERENCE,
  );

  const mockConfig = {
    powercard: {
      rateCardVersion: -1,
      enableStoreIdOverride: false,
      storeIdOverrideValue: '',
      dontEnablePayAtTableListener: true,
      marsCreditLimitBypass: false,
      emailFromAddress: 'test@email.com',
    },
  };

  const mockTransaction = ({
    id: 1,
    customerUuid: 'test-customer-uuid',
    brandSpecificLocationId: 123,
    tip: 10,
    uuid: 'test-fake-transaction-uuid-authorization-code',
    powercard: {
      cardNumber: '1234',
    },
    paymentProviderTransactionId: 'braintreeTxId',
    paymentInfo: {
      data: [
        {
          cardType: 'mastercard',
        },
      ],
    },
    status: TRANSACTION_STATUS.CLOSED,
  } as unknown) as Transaction; // force casting to Transcation in order not to mock too much

  const mockTransactionRepository = {
    findOneOrFail: jest.fn().mockReturnValueOnce(mockTransaction),
  };

  const mockTimezone = 'America/Chicago';

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReceiptEmailBuilder,
        {
          provide: POWERCARD_SERVICE_CONFIG,
          useValue: mockConfig.powercard,
        },
        {
          provide: TRANSACTION_REPOSITORY_TOKEN,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    receiptEmailBuilder = module.get<ReceiptEmailBuilder>(ReceiptEmailBuilder);

    generatedEmail = await receiptEmailBuilder.buildReceiptEmailHtml(
      mockReceipt,
      mockTimezone,
      mockTransaction,
    );
  });

  describe('receipt email builder', () => {
    test('generated email should match to snapshot', async () => {
      expect(generatedEmail).toMatchSnapshot();
    });

    it(`should show receipt's total price`, async () => {
      const totalPrice = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(mockReceipt.total);

      expect(generatedEmail).toEqual(expect.stringContaining(totalPrice));
      expect(generatedEmail).toEqual(expect.stringContaining('total'));
    });

    it(`should show receipt's menu item `, async () => {
      const menuItemPrice = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(mockMenuItem.amount);

      expect(generatedEmail).toEqual(
        expect.stringContaining(mockMenuItem.description),
      );
      expect(generatedEmail).toEqual(expect.stringContaining(menuItemPrice));
      expect(generatedEmail).toEqual(
        expect.stringContaining(mockMenuItem.quantity.toString()),
      );
    });
    it(`should show receipt's tip`, async () => {
      const tipPrice = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(mockTip.amount);

      expect(generatedEmail).toEqual(expect.stringContaining('$ CHARGED TIP'));
      expect(generatedEmail).toEqual(expect.stringContaining(tipPrice));
    });
    it(`should show receipt's tender`, async () => {
      const tenderPrice = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(mockTender.amount);

      expect(generatedEmail).toEqual(
        expect.stringContaining(mockTender.description),
      );
      expect(generatedEmail).toEqual(expect.stringContaining(tenderPrice));
    });
    it(`should show receipt's actual if tender is unknown`, async () => {
      const tenderPrice = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
      }).format(mockTender.amount);

      expect(generatedEmail).toEqual(expect.stringContaining(tenderPrice));
      expect(generatedEmail).toEqual(expect.stringContaining(tenderPrice));
    });
    it(`should not show receipt's reference`, async () => {
      expect(generatedEmail).toEqual(
        // @ts-ignore: Property does not exist
        expect.not.stringMatching(mockReference.reference),
      );
    });
  });
});
