import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppointmentModule, BaseModule } from './modules';
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
