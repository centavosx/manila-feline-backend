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
  ProductReview,
  Replies,
  Role,
  Services,
  Status,
  User,
  UserPayment,
  UserTransaction,
} from '../../../entities';
import {
  Brackets,
  DataSource,
  FindOptionsOrderValue,
  ILike,
  Repository,
} from 'typeorm';

import {
  CreateAppointmentDto,
  CreateEmailDto,
  ReplyMailDto,
  SearchDoctorDto,
  SearchProductDto,
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

@Injectable()
export class ProductService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(User) private readonly userRepository: Repository<User>,

    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(UserPayment)
    private readonly userPayment: Repository<UserPayment>,
    @InjectRepository(UserTransaction)
    private readonly userTransaction: Repository<UserTransaction>,
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductReview)
    private readonly productReviewRepo: Repository<Product>,
    private readonly mailService: MailService,
  ) {}

  public async getAll(query: SearchProductDto): Promise<ResponseDto> {
    const data = await this.productRepo.find({
      where: !!query.search
        ? [
            {
              name: ILike(query.search + '%'),
            },
          ]
        : undefined,

      skip: (query.page ?? 0) * (query.limit ?? 20),
      take: query.limit ?? 20,
      order: query.sort && {
        name: query.sort as FindOptionsOrderValue,
      },
    });

    const total = await this.productRepo.count({
      where: !!query.search
        ? [
            {
              name: ILike(query.search + '%'),
            },
          ]
        : undefined,
    });

    return {
      data,
      total,
    };
  }

  public async reviewProduct(id: string) {}
}
