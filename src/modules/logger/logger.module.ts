import { Module } from '@nestjs/common';
import { LoggerService } from '@open-commerce/nestjs-logger';

@Module({
  imports: [],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
