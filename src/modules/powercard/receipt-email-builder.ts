import * as fs from 'fs';
import {
  EmailInputDto,
  Receipt,
  ReceiptLineItem,
  CHECK_LINE_ITEM_TYPE,
  Transaction,
} from '@open-commerce/data-objects';
import * as moment from 'moment-timezone';
import { get } from 'lodash';
import { POWERCARD_SERVICE_CONFIG } from '../../config/config.constants';
import { Inject } from '@nestjs/common';
import { IPowercardServiceConfig } from '../../config/powercard-service-config.interface';

const NUMBER_FORMAT = 'en-US';
const CURRENCY_FORMAT = 'USD';

const RECEIPT_EMAIL_SUBJECT = `Your Dave & Buster's Receipt`;

const PRICE_SUMMARY = [
  {
    description: 'subtotal',
    amount: 'subTotal',
  },
  {
    description: 'tax',
    amount: 'tax',
  },
];

const LINE_ITEMS_SLUG = '~~LINE_ITEMS~~';
const CHECK_NUMBER = '~~CHECK_NUMBER~~';
const PRICE_SUMMARY_SLUG = '~~PRICE_SUMMARY~~';
const TOTAL_PRICE_SLUG = `~~TOTAL_PRICE~~`;
const DATE_SLUG = `~~DATE~~`;
const TENDER_SLUG = `~~TENDER~~`;
const TIP_SLUG = `~~TIP~~`;
const PAYMENT_PROVIDER_TRANSACTION_ID: string =
  '~~PAYMENT_PROVIDER_TRANSACTION_ID~~';

export class ReceiptEmailBuilder {
  private emailFromAddress: string = null;

  public constructor(
    @Inject(POWERCARD_SERVICE_CONFIG)
    private readonly config: IPowercardServiceConfig,
  ) {
    this.initialize();
  }

  public initialize() {
    this.emailFromAddress = this.config.emailFromAddress;

    if (!this.emailFromAddress) {
      throw new Error(
        `You must specify the environment variables OC__EMAIL_FROM_ADDRESS!
                          examples:
                          export OC__EMAIL_FROM_ADDRESS=scott.wasserman@stuzo.com
                          `,
      );
    }
  }

  public async buildEmailInputDto(
    toAddress: string,
    receipt: Receipt,
    timezone: string,
    transaction: Transaction,
  ): Promise<EmailInputDto> {
    const emailInput = new EmailInputDto();
    emailInput.fromAddress = this.emailFromAddress;
    emailInput.toAddress = toAddress;
    emailInput.html = await this.buildReceiptEmailHtml(
      receipt,
      timezone,
      transaction,
    );
    emailInput.subject = RECEIPT_EMAIL_SUBJECT;
    // TODO: add text email?
    return emailInput;
  }

  public fillLineItem(
    description: string,
    amount: number,
    quantity: string | number = '',
  ): string {
    return `
        <tr style="font-size: 12px;border: none;">
            <td style="padding-top: 5px;font-size: 12px;text-transform: uppercase;font-weight: bold;border: none;">
                ${quantity} ${description}
            </td>
            <td style="padding-top: 5px;font-size: 12px; text-align: right;border: none;">
                ${new Intl.NumberFormat(NUMBER_FORMAT, {
                  style: 'currency',
                  currency: CURRENCY_FORMAT,
                }).format(amount)}
            </td>
      </tr>`;
  }

  public getDateHtml(receipt: Receipt, timezone: string): string {
    const { checkOpenTime } = receipt;

    const time = moment(checkOpenTime).tz(timezone);

    return `
        <td style="border: none; text-align: right; font-size: 0.5em;">
          ${time.format('MMMM DD, YYYY')}
        <br>
          ${time.format('hh:mm A')}
        </td>
      `;
  }

  public getLineItemsHtml(lineItems: ReceiptLineItem[]): string {
    let receiptLineItemsHtml: string = '';

    const orderedLineItems: ReceiptLineItem[] = lineItems.filter(item =>
      [CHECK_LINE_ITEM_TYPE.MENU_ITEM, CHECK_LINE_ITEM_TYPE.DISCOUNT].includes(
        item.itemType as CHECK_LINE_ITEM_TYPE,
      ),
    );

    orderedLineItems.forEach(item => {
      const html = this.fillLineItem(
        item.description,
        item.amount,
        item.quantity,
      );

      receiptLineItemsHtml = receiptLineItemsHtml.concat(html);
    });

    return receiptLineItemsHtml;
  }

  public async getTendersHtml(
    receipt: Receipt,
    lineItems: ReceiptLineItem[],
    transaction: Transaction,
  ): Promise<string> {
    let receiptTenderHtml: string = '';
    const tenders: ReceiptLineItem[] = lineItems.filter(
      item => item.itemType === CHECK_LINE_ITEM_TYPE.TENDER,
    );

    for (const tender of tenders) {
      const { amount } = tender;
      let { description } = tender;

      if (description.toLowerCase() === 'unknown') {
        const paymentMethodName = get(
          transaction,
          'paymentInfo.data.0.cardType',
        ) as string;
        description = paymentMethodName;
      }
      const html = this.fillLineItem(description, amount);

      receiptTenderHtml = receiptTenderHtml.concat(html);
    }

    return receiptTenderHtml;
  }

  public getPriceSummaryHtml(receipt: Receipt): string {
    let receiptPriceSummaryHtml = '';

    Object.keys(PRICE_SUMMARY).forEach(key => {
      const description: string = PRICE_SUMMARY[key].description;
      const amount: string = PRICE_SUMMARY[key].amount;
      const html = this.fillLineItem(description, receipt[amount]);

      receiptPriceSummaryHtml = receiptPriceSummaryHtml.concat(html);
    });

    return receiptPriceSummaryHtml;
  }

  public getTipHtml(lineItems: ReceiptLineItem[]): string {
    const tip: ReceiptLineItem = lineItems.find(
      item => item.itemType === CHECK_LINE_ITEM_TYPE.TIP,
    );

    const tipValue = tip ? tip.amount : 0.0;

    return this.fillLineItem('$ CHARGED TIP', tipValue);
  }

  public async buildReceiptEmailHtml(
    receipt: Receipt,
    timezone: string,
    transaction: Transaction,
  ): Promise<string> {
    const { lineItems } = receipt;
    const formattedTotalPrice: string = new Intl.NumberFormat(NUMBER_FORMAT, {
      style: 'currency',
      currency: CURRENCY_FORMAT,
    }).format(receipt.total);

    let emailHtml = fs
      .readFileSync(__dirname + '/receipt_email.html')
      .toString();

    emailHtml = emailHtml.replace(
      new RegExp(CHECK_NUMBER, 'g'),
      receipt.checkNumber + '',
    );

    emailHtml = emailHtml.replace(
      new RegExp(PAYMENT_PROVIDER_TRANSACTION_ID, 'g'),
      transaction.paymentProviderTransactionId + '',
    );

    emailHtml = emailHtml.replace(
      new RegExp(LINE_ITEMS_SLUG, 'g'),
      this.getLineItemsHtml(lineItems),
    );

    emailHtml = emailHtml.replace(
      new RegExp(PRICE_SUMMARY_SLUG, 'g'),
      this.getPriceSummaryHtml(receipt),
    );

    emailHtml = emailHtml.replace(
      new RegExp(TOTAL_PRICE_SLUG, 'g'),
      formattedTotalPrice,
    );

    emailHtml = emailHtml.replace(
      new RegExp(DATE_SLUG, 'g'),
      this.getDateHtml(receipt, timezone),
    );

    emailHtml = emailHtml.replace(
      new RegExp(TIP_SLUG, 'g'),
      this.getTipHtml(lineItems),
    );

    emailHtml = emailHtml.replace(
      new RegExp(TENDER_SLUG, 'g'),
      await this.getTendersHtml(receipt, lineItems, transaction),
    );

    return emailHtml;
  }
}
