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
  Product,
  ProductReview,
  ProductImages,
} from '../../entities';
import {
  OtherController,
  ProductController,
  TransactionController,
} from './controllers';
import { OtherService, ProductService, TransactionService } from './services';

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
      Product,
      ProductReview,
      ProductImages,
    ]),
  ],
  controllers: [OtherController, ProductController, TransactionController],
  providers: [OtherService, MailService, ProductService, TransactionService],
})
export class OtherModule {}
