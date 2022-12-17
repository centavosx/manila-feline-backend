import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, User, UserRole } from '../../entities';
import { BaseController, RoleController } from './controllers';
import { BaseService, RoleService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  controllers: [BaseController, RoleController],
  providers: [BaseService, RoleService],
})
export class BaseModule {}
