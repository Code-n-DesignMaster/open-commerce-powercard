import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { CONFIG_TOKEN, ConfigModule } from '@open-commerce/nestjs-config';
import { config } from './config/config';
import { ISchemaConfig } from './config/config.interface';
import { TerminusModule, TerminusModuleOptions } from '@nestjs/terminus';
import { PowercardGraphQLModule } from './modules/powercard-graphql/powercard-graphql.module';
import { LoggerModule } from './modules/logger/logger.module';
import { LocationGraphqlModule } from './modules/location-graphql/location-graphql.module';
import { BrandGraphqlModule } from './modules/brand-graphql/brand-graphql.module';
import { PowercardBalancesModule } from './modules/powercard-balances/powercard-balances.module';
import { PowercardModule } from './modules/powercard/powercard.module';
import { MarsModule } from './modules/mars/mars.module';
import { RabbitmqModule } from '@open-commerce/nestjs-rabbitmq';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { version } from './version';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGraphqlModule } from './modules/admin-graphql/admin-graphql.module';

const configModule = ConfigModule.forRoot(config);

@Module({
  imports: [
    PowercardBalancesModule,
    MarsModule,
    PowercardModule,
    GraphQLModule.forRootAsync({
      imports: [configModule],
      useFactory: (config: ISchemaConfig) => config.graphql,
      inject: [CONFIG_TOKEN],
    }),
    AdminGraphqlModule,
    PowercardGraphQLModule,
    BrandGraphqlModule,
    LocationGraphqlModule,
    LoggerModule,
    TypeOrmModule.forRoot({}),
    TerminusModule.forRootAsync({
      useFactory: () => {
        return {
          endpoints: [
            {
              // The health check will be available with /health-check
              url: '/health-check',
              // All the indicators which will be checked when requesting /health
              healthIndicators: [
                async () => {
                  return ({
                    ...version,
                  } as unknown) as HealthIndicatorResult;
                },
              ],
            },
          ],
        } as TerminusModuleOptions;
      },
    }),
    RabbitmqModule,
  ],
  providers: [],
})
export class AppModule {}
