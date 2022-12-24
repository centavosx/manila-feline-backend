import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';

import { ConfigService, ConfigModule } from '@nestjs/config';
import { AppointmentModule, BaseModule } from './modules';
import {
  User,
  UserRole,
  Appointment,
  Availability,
  Role,
  Token,
} from './entities';
import { TokenService } from './authentication/services/token.service';
import {
  AuthMiddleware,
  RefreshMiddleware,
} from './authentication/middleware/auth.middleware';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolesGuard } from './guards/roles.guard';
import { MailService } from './mail/mail.service';
import { RefreshController } from './authentication/controller/refresh.controller';
import { dataSourceOptions } from './config/config';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env' }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AppointmentModule,
    BaseModule,
  ],
  controllers: [RefreshController],
  providers: [ConfigService, TokenService, RolesGuard, MailService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude({ path: '/refresh', method: RequestMethod.GET })
      .forRoutes('*');
    consumer
      .apply(RefreshMiddleware)
      .forRoutes({ path: '/refresh', method: RequestMethod.GET });
  }
}
