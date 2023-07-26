import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from '../../authentication/services/token.service';
import { MailService } from '../../mail/mail.service';
import { Role, User, Token, Services } from '../../entities';
import { BaseController, RoleController } from './controllers';
import { BaseService, RoleService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Token, Services])],
  controllers: [BaseController, RoleController],
  providers: [BaseService, RoleService, MailService, TokenService],
  exports: [TypeOrmModule.forFeature([User, Role, Token, Services])],
})
export class BaseModule {}
