import { Module } from '@nestjs/common';
import { PowercardsResolver } from './powercard-graphql.resolver';
import { PowercardModule } from '../powercard/powercard.module';
import { LoggerModule } from '../logger/logger.module';
import { PowercardBalancesModule } from '../powercard-balances/powercard-balances.module';
import { PubSub } from 'apollo-server-express';
import { ConfigModule, CONFIG_TOKEN } from '@open-commerce/nestjs-config';
import { RedisModule } from '@open-commerce/nestjs-redis';
import { config } from '../../config/config';

const configModule = ConfigModule.forRoot(config);
@Module({
  imports: [
    RedisModule.forRootAsync({
      imports: [configModule],
      useFactory: config => config.redis,
      inject: [CONFIG_TOKEN],
    }),
    LoggerModule,
    PowercardModule,
    PowercardBalancesModule,
  ],
  providers: [PowercardsResolver, PubSub],
  exports: [],
})
export class PowercardGraphQLModule {}
