import { RabbitmqOptions } from '@open-commerce/nestjs-rabbitmq';

export interface IPayAnywhereConfig {
  checkRetryCount: number;
  checkRetryDelay: number;
  rabbitmq: RabbitmqOptions;
  checkUpdateExpirationSeconds: number;
}
