import './apm';
import { CONFIG_TOKEN } from '@open-commerce/nestjs-config';
import * as path from 'path';
import { RollbarInitializer } from '@open-commerce/rollbar';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { ISchemaConfig } from './config/config.interface';
import { AppModule } from './app.module';
import { ApolloValidationPipe } from './apollo-validation-pipe';
import { PowercardBalancesService } from './modules/powercard-balances/powercard-balances.service';
import { PowercardService } from './modules/powercard/powercard.service';
const loggerContext = 'main.ts';

async function bootstrap() {
  Logger.log(`bootstrapping`, loggerContext);
  const app = await NestFactory.create(AppModule);
  const config: ISchemaConfig = app.get(CONFIG_TOKEN);

  const filename = path.basename(__filename);

  RollbarInitializer.configureNestAppIfNecessary(app, Logger, process.env);

  app.useGlobalPipes(new ApolloValidationPipe());
  Logger.log(
    `app has been configured to use ApolloValidationPipe globally`,
    loggerContext,
  );

  await app.listen(config.port);
  Logger.log(`started server on port ${config.port}`, filename);

  // Connect to card balance queue in MARS and handle balance messages
  const powercardBalanceService = app.get<PowercardBalancesService>(
    PowercardBalancesService,
  );
  await powercardBalanceService.startListeningToBalanceQueue();
  const powercardService = app.get<PowercardService>(PowercardService);
  await powercardService.startListeningToPayAnywhereQueue();
}

bootstrap().catch(e => {
  Logger.error('Failed to bootstrap', e.toString(), 'Powercard Service');
});
