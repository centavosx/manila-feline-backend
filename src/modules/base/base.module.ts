import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from 'src/authentication/services/token.service';
import { MailService } from 'src/mail/mail.service';
import { Role, User, UserRole, Token } from '../../entities';
import { BaseController, RoleController } from './controllers';
import { BaseService, RoleService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, UserRole, Token])],
  controllers: [BaseController, RoleController],
  providers: [BaseService, RoleService, MailService, TokenService],
  exports: [TypeOrmModule.forFeature([User, Role, UserRole, Token])],
})
export class BaseModule {}
