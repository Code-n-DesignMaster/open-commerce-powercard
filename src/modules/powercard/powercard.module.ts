import { Module } from '@nestjs/common';
import { MarsCachingModule } from '../mars-caching/mars-caching.module';
import { PowercardService } from './powercard.service';
import { powercardProviders } from './powercard.providers';
import { LoggerModule } from '@open-commerce/nestjs-logger';
import { MarsModule } from '../mars/mars.module';
import {
  OfferRedemption,
  Powercard,
  PowercardImagePack,
  PowercardBalanceSnapshot,
  Transaction,
  Rating,
  Receipt,
  TableGuid,
  PromoImage,
} from '@open-commerce/data-objects';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RabbitmqModule } from '@open-commerce/nestjs-rabbitmq';
import { config } from '../../config/config';
import { ConfigModule } from '@open-commerce/nestjs-config';

@Module({
  imports: [
    ConfigModule.forRoot(config),
    TypeOrmModule.forFeature([
      Powercard,
      PowercardImagePack,
      PowercardBalanceSnapshot,
      Transaction,
      OfferRedemption,
      Rating,
      Receipt,
      PromoImage,
      TableGuid,
    ]),
    RabbitmqModule,
    LoggerModule,
    MarsModule,
    MarsCachingModule,
  ],
  providers: powercardProviders,
  exports: [PowercardService],
})
export class PowercardModule {}
