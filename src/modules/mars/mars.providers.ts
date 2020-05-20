import { CONFIG_TOKEN } from '@open-commerce/nestjs-config';
import {
  MARS_SERVICE_CONFIG,
  ENABLE_CONFIG_LOGGING,
} from '../../config/config.constants';
import { IMarsConfig } from '../../config/mars-config.interface';
import { MarsService } from './mars.service';
import { MARS_API_TOKEN } from './mars.constants';
import { MockMarsAPI } from './__mocks__/MockMarsAPI';
import { Logger } from '@nestjs/common';
import { MarsCachingService } from '../mars-caching/mars-caching.service';
import { LoggerService } from '@open-commerce/nestjs-logger';

export const marsProviders = [
  {
    provide: MARS_SERVICE_CONFIG,
    useFactory: config => {
      return config.mars;
    },
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
    provide: MARS_API_TOKEN,
    useFactory: (
      logger: LoggerService,
      marsCachingService: MarsCachingService,
      marsConfig: IMarsConfig,
      enableConfigLogging: boolean,
    ) => {
      if (marsConfig.enableMock) {
        new Logger().log(
          'Mocking MARS API because ENABLE_MARS_MOCK is true',
          'marsProviders',
        );
        return new MockMarsAPI();
      }

      // TODO: Ryan, What to do here????
      return new MarsService(
        logger,
        marsCachingService,
        marsConfig,
        enableConfigLogging,
      );
    },
    provider: [],
    inject: [
      LoggerService,
      MarsCachingService,
      MARS_SERVICE_CONFIG,
      ENABLE_CONFIG_LOGGING,
    ],
  },
];
