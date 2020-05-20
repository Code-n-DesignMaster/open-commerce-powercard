import { Module } from '@nestjs/common';
import { ConfigModule } from '@open-commerce/nestjs-config';
import { LoggerModule } from '../logger/logger.module';
import { powercardBalancesProviders } from './powercard-balances.providers';
import { PowercardBalancesService } from './powercard-balances.service';
import { MarsCachingModule } from '../mars-caching/mars-caching.module';
import {
  RabbitmqModule,
  RabbitmqService,
} from '@open-commerce/nestjs-rabbitmq';
import { PowercardModule } from '../../modules/powercard/powercard.module';
import { MarsModule } from '../mars/mars.module';
import { config } from '../../config/config';

@Module({
  imports: [
    LoggerModule,
    RabbitmqModule,
    PowercardModule,
    MarsCachingModule,
    MarsModule,
    ConfigModule.forRoot(config),
  ],
  providers: [
    PowercardBalancesService,
    RabbitmqService,
    ...powercardBalancesProviders,
  ],
  exports: [PowercardBalancesService],
})
export class PowercardBalancesModule {}
