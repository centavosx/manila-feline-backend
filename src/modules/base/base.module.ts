import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { Role, User, UserRole } from '../../entities';
import { BaseController, RoleController } from './controllers';
import { BaseService, RoleService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole])],
  controllers: [BaseController, RoleController],
  providers: [BaseService, RoleService, MailService],
  exports: [TypeOrmModule.forFeature([User, Role, UserRole])],
})
export class BaseModule {}
