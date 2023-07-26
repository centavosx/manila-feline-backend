import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MailService } from 'src/mail/mail.service';
import { User, Services, Appointment } from '../../entities';
import { AppointmentController } from './controllers';
import { AppointmentService } from './services';

@Module({
  imports: [TypeOrmModule.forFeature([User, Services, Appointment])],
  controllers: [AppointmentController],
  providers: [AppointmentService, MailService],
})
export class AppointmentModule {}
