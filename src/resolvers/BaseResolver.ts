import { isEmpty } from 'lodash';
import { LoggerService } from '@open-commerce/nestjs-logger';

export class BaseResolver {
  private loggerContext = this.constructor.name;

  constructor(protected logger: LoggerService) {}

  protected log(message: string, obj?: object) {
    const fullMessage = `${message} ${
      isEmpty(obj) ? '' : ` : ${JSON.stringify(obj)}`
    }`;

    this.logger.debug({ msg: fullMessage }, this.loggerContext);
  }
}
