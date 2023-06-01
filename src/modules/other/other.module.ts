import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Replies } from '../../entities/replies.entity';
import { MailService } from '../../mail/mail.service';
import {
  Role,
  User,
  Token,
  Services,
  Availability,
  ContactUs,
  Appointment,
  UserPayment,
  UserTransaction,
} from '../../entities';
import { OtherController } from './controllers';
import { OtherService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Role,
      Token,
      Services,
      Availability,
      ContactUs,
      Replies,
      Appointment,
      UserPayment,
      UserTransaction,
    ]),
  ],
  controllers: [OtherController],
  providers: [OtherService, MailService],
})
export class OtherModule {}
