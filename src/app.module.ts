import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppointmentModule } from './appointment/appointment.module';
import { BaseModule } from './base/base.module';
import { Config } from './config/config';
import {
  User,
  UserRole,
  Appointment,
  Availability,
  Role,
  Token,
} from './entities';

@Module({
  imports: [
    Config([User, UserRole, Appointment, Availability, Role, Token]),
    AppointmentModule,
    BaseModule,
  ],
  providers: [ConfigService],
})
export class AppModule {}
