import { Connection } from 'typeorm';
import { BRAND_REPOSITORY_TOKEN } from './constants/brand.constants';
import { DB_CONNECTION_TOKEN } from '@open-commerce/nestjs-database';
import { Brand } from '@open-commerce/data-objects';

export const brandProviders = [
  {
    provide: BRAND_REPOSITORY_TOKEN,
    useFactory: (connection: Connection) => connection.getRepository(Brand),
    inject: [DB_CONNECTION_TOKEN], // gets injected into ^ 'connection' variable
  },
];
