import { CONFIG_TOKEN } from '@open-commerce/nestjs-config';
import { ADMIN_SERVICE_CONFIG } from '../../config/config.constants';

export const adminProviders = [
  {
    provide: ADMIN_SERVICE_CONFIG,
    useFactory: config => {
      return config.admin;
    },
    inject: [CONFIG_TOKEN],
  },
];
