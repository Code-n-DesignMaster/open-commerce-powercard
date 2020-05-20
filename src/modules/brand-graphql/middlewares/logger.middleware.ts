import { Injectable, NestMiddleware } from '@nestjs/common';
import { LoggerService } from '@open-commerce/nestjs-logger';

@Injectable()
export class ApiLoggerMiddleware implements NestMiddleware {
  private readonly loggerContext = this.constructor.name;

  constructor(private readonly logger: LoggerService) {}
  public use(req: Request, res: Response, next: any) {
    this.logger.info(`${req.url} was called`, this.loggerContext);
    next();
  }
}
