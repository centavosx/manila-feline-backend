import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Appointment,
  Availability,
  ContactUs,
  Product,
  Replies,
  Role,
  Services,
  Status,
  User,
  UserPayment,
  UserTransaction,
} from '../../../entities';
import { Brackets, DataSource, ILike, Repository } from 'typeorm';

import {
  CreateAppointmentDto,
  CreateEmailDto,
  ReplyMailDto,
  SearchDoctorDto,
  VerifyAppointmentDto,
} from '../dto';

import { MailService } from '../../../mail/mail.service';
import { DeleteDto, ResponseDto, SearchUserDto } from '../../base/dto';
import { Roles } from '../../../enum';

import {
  addHours,
  addMonths,
  endOfMonth,
  format,
  startOfMonth,
} from 'date-fns';
import { Paypal, getPaymentInfo } from '../../../paypal';
import { SearchPaymentDto } from 'src/modules/base/dto/search-payments.dto';

@Injectable()
export class TransactionService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Services)
    private readonly serviceRepository: Repository<Services>,
    @InjectRepository(ContactUs)
    private readonly contactRepository: Repository<ContactUs>,
    @InjectRepository(Replies)
    private readonly replyRepository: Repository<Replies>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(UserPayment)
    private readonly userPayment: Repository<UserPayment>,
    @InjectRepository(UserTransaction)
    private readonly userTransaction: Repository<UserTransaction>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    private readonly mailService: MailService,
  ) {}

  public async getAll(
    query: SearchPaymentDto,
    id?: string,
  ): Promise<ResponseDto> {
    const q = this.userPayment
      .createQueryBuilder('user_payment')
      .select(['"refId"', '"userId"', 'created']);

    const copy = this.userPayment
      .createQueryBuilder('user_payment')
      .select(['"refId"', '"userId"', 'created']);

    if (!!id) {
      q.andWhere('user_payment."userId" = :id');
      copy.andWhere('user_payment."userId" = :id');
    }

    q.andWhere('user_payment."userId" IS NOT NULL');
    copy.andWhere('user_payment."userId" IS NOT NULL');

    q.skip((query.page ?? 0) * (query.limit ?? 20)).take(query.limit ?? 20);

    if (!!query.sort)
      q.orderBy(
        'created',
        (query?.sort as string).toUpperCase() as 'ASC' | 'DESC',
      );

    q.groupBy('"refId", "created", "userId"');
    copy.groupBy('"refId", "created", "userId"');

    q.setParameters({
      id,
    });

    copy.setParameters({
      id,
    });

    return {
      data: await q.getRawMany(),
      total: (await copy.getRawMany()).length,
    };
  }
}
