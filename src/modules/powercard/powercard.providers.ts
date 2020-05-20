import { CONFIG_TOKEN } from '@open-commerce/nestjs-config';
import { Repository } from 'typeorm';
import {
  ENABLE_CONFIG_LOGGING,
  PAY_ANYWHERE_CONFIG,
  POWERCARD_SERVICE_CONFIG,
} from '../../config/config.constants';
import {
  POWERCARD_IMAGE_PACK_REPOSITORY_TOKEN,
  POWERCARD_REPOSITORY_TOKEN,
  TRANSACTION_REPOSITORY_TOKEN,
  POWERCARD_BALANCE_SNAPSHOT_REPOSITORY_TOKEN,
  RATING_REPOSITORY_TOKEN,
  RECEIPT_REPOSITORY_TOKEN,
  NOTIFICATION_SERVICE_CLIENT_TOKEN,
  TABLE_GUID_REPOSITORY_TOKEN,
  TRANSACTION_SERVICE_TOKEN,
  CUSTOMER_SERVICE_TOKEN,
  MOBILE_PASS_SERVICE_TOKEN,
  OFFER_REDEMPTION_REPOSITORY_TOKEN,
  PROMO_IMAGE_REPOSITORY_TOKEN,
  RABBITMQ_SERVICE_TOKEN,
  RECEIPT_EMAIL_BUILDER_TOKEN,
} from './constants/powercard.constants';
import {
  Powercard,
  PowercardImagePack,
  PowercardBalanceSnapshot,
  Transaction,
  Rating,
  Receipt,
  TableGuid,
  OfferRedemption,
  PromoImage,
} from '@open-commerce/data-objects';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotificationServiceGraphqlClient,
  TransactionServiceGraphqlClient,
  CustomerServiceGraphqlClient,
  PassManagementServiceGraphqlClient,
} from '@open-commerce/internal-services-api';
import {
  RabbitmqService,
  RabbitmqOptions,
} from '@open-commerce/nestjs-rabbitmq';
import { LoggerService } from '@open-commerce/nestjs-logger';
import { ISchemaConfig } from '../../config/config.interface';
import { ReceiptEmailBuilder } from './receipt-email-builder';
import { PowercardService } from './powercard.service';

export const powercardProviders = [
  PowercardService,
  RabbitmqService,
  {
    provide: POWERCARD_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<Powercard>) => repo,
    inject: [getRepositoryToken(Powercard)],
  },
  {
    provide: POWERCARD_IMAGE_PACK_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<PowercardImagePack>) => repo,
    inject: [getRepositoryToken(PowercardImagePack)],
  },
  {
    provide: POWERCARD_BALANCE_SNAPSHOT_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<PowercardBalanceSnapshot>) => repo,
    inject: [getRepositoryToken(PowercardBalanceSnapshot)],
  },
  {
    provide: TRANSACTION_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<Transaction>) => repo,
    inject: [getRepositoryToken(Transaction)],
  },
  {
    provide: NOTIFICATION_SERVICE_CLIENT_TOKEN,
    useClass: NotificationServiceGraphqlClient,
  },
  {
    provide: RATING_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<Rating>) => repo,
    inject: [getRepositoryToken(Rating)],
  },
  {
    provide: RECEIPT_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<Receipt>) => repo,
    inject: [getRepositoryToken(Receipt)],
  },
  {
    provide: TABLE_GUID_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<TableGuid>) => repo,
    inject: [getRepositoryToken(TableGuid)],
  },
  {
    provide: POWERCARD_SERVICE_CONFIG,
    useFactory: (config: ISchemaConfig) => config.powercard,
    inject: [CONFIG_TOKEN],
  },
  {
    provide: PAY_ANYWHERE_CONFIG,
    useFactory: (config: ISchemaConfig) => config.payAnywhere,
    inject: [CONFIG_TOKEN],
  },
  {
    provide: ENABLE_CONFIG_LOGGING,
    useFactory: config => {
      return config.enableConfigLogging;
    },
    inject: [CONFIG_TOKEN],
  },
  {
    provide: TRANSACTION_SERVICE_TOKEN,
    useClass: TransactionServiceGraphqlClient,
  },
  {
    provide: CUSTOMER_SERVICE_TOKEN,
    useClass: CustomerServiceGraphqlClient,
  },
  {
    provide: MOBILE_PASS_SERVICE_TOKEN,
    useClass: PassManagementServiceGraphqlClient,
  },
  {
    provide: OFFER_REDEMPTION_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<OfferRedemption>) => repo,
    inject: [getRepositoryToken(OfferRedemption)],
  },
  {
    provide: RECEIPT_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<Receipt>) => repo,
    inject: [getRepositoryToken(Receipt)],
  },
  {
    provide: PROMO_IMAGE_REPOSITORY_TOKEN,
    useFactory: (repo: Repository<PromoImage>) => repo,
    inject: [getRepositoryToken(PromoImage)],
  },
  {
    provide: RABBITMQ_SERVICE_TOKEN,
    useFactory: (loggerService: any, config: any) => {
      return new RabbitmqService(
        loggerService,
        config.payAnywhere.rabbitmq as RabbitmqOptions,
      );
    },
    inject: [LoggerService, CONFIG_TOKEN],
  },
  {
    provide: RECEIPT_EMAIL_BUILDER_TOKEN,
    useClass: ReceiptEmailBuilder,
  },
];
