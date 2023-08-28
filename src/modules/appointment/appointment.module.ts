import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailService } from '../../mail/mail.service';
import { User, Services, Appointment, UserPayment } from '../../entities';
import { AppointmentController } from './controllers';
import { AppointmentService } from './services';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Services, Appointment, UserPayment]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService, MailService],
})
export class AppointmentModule {}
