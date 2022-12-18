import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { ConfigService, ConfigModule } from '@nestjs/config';
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
import { TokenService } from './authentication/services/token.service';
import { AuthMiddleware } from './authentication/middleware/auth.middleware';

import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesGuard } from './guards/roles.guard';
import { MailService } from './mail/mail.service';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    Config([User, UserRole, Appointment, Availability, Role, Token]),
    AppointmentModule,
    BaseModule,
    TypeOrmModule.forFeature([Token]),
  ],
  providers: [ConfigService, TokenService, RolesGuard, MailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
