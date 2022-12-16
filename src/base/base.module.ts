import { Module } from '@nestjs/common';
import { BaseController } from './controllers/base.controller';
import { BaseService } from './services/base.service';

@Module({
  controllers: [BaseController],
  providers: [BaseService],
})
export class BaseModule {}
