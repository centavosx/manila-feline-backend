import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TokenService } from 'src/authentication/services/token.service';
import { MailService } from 'src/mail/mail.service';
import { Role, User, Token, Services } from '../../entities';
import { ServiceController } from './controllers';
import { ServiceService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Services])],
  controllers: [ServiceController],
  providers: [ServiceService],
  exports: [TypeOrmModule.forFeature([Services])],
})
export class ServiceModule {}
