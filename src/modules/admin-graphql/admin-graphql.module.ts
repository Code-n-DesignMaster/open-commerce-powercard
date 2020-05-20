import { AdminModule } from '../admin/admin.module';
import { Module } from '@nestjs/common';
import { AdminResolver } from './admin-graphql.resolver';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [AdminModule, LoggerModule],
  providers: [AdminResolver],
})
export class AdminGraphqlModule {}
