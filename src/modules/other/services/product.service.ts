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
  ProductImages,
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
  ProductDto,
  ReplyMailDto,
  ReviewProductDto,
  SearchDoctorDto,
  SearchProductDto,
  UpdateProductDto,
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
    private readonly productReviewRepo: Repository<ProductReview>,

    @InjectRepository(ProductImages)
    private readonly productImageRepo: Repository<ProductImages>,
    private readonly mailService: MailService,
  ) {}

  public async getAll(query: SearchProductDto): Promise<ResponseDto> {
    const q = this.productRepo
      .createQueryBuilder('product')
      .select([
        '"product".id',
        'name',
        'description',
        'items',
        'created',
        'modified',
        'short_description as shortDescription',
        'description',
        'category',
        'avg as rating',
        'link as image',
        'price',
      ])
      .leftJoin(
        (qb) =>
          qb
            .select([
              'product_review."productId" as "productId"',
              'AVG(rating)',
            ])
            .from(ProductReview, 'product_review')
            .groupBy('product_review."productId"'),
        'review_tbl',
        '"review_tbl"."productId" = "product"."id"',
      )
      .leftJoin(
        'product_images',
        'product_images',
        '"product_images"."productId" = "product"."id"  AND "product_images".pos = \'first\'',
      );

    const copy = this.productRepo
      .createQueryBuilder('product')
      .select([
        '"product".id',
        'name',
        'description',
        'items',
        'created',
        'modified',
        'short_description as shortDescription',
        'description',
        'category',
        'avg as rating',
        'link as image',
        'price',
      ])
      .leftJoin(
        (qb) =>
          qb
            .select([
              'product_review."productId" as "productId"',
              'AVG(rating)',
            ])
            .from(ProductReview, 'product_review')
            .groupBy('product_review."productId"'),
        'review_tbl',
        '"review_tbl"."productId" = "product"."id"',
      )
      .leftJoin(
        'product_images',
        'product_images',
        '"product_images"."productId" = "product"."id"  AND "product_images".pos = \'first\'',
      );

    if (!!query.search) {
      q.andWhere('name LIKE :name');
      copy.andWhere('name LIKE :name');
    }

    if (!!query.category) {
      q.andWhere('category = :category');
      copy.andWhere('category = :category');
    }

    if (!!query.in) {
      q.andWhere('"product".id IN (:...in)');
      copy.andWhere('"product".id IN (:...in)');
    }

    if (!!query.notIn) {
      q.andWhere('"product".id NOT IN (:...notIn)');
      copy.andWhere('"product".id NOT IN (:...notIn)');
    }

    q.skip((query.page ?? 0) * (query.limit ?? 20)).take(query.limit ?? 20);
    if (!!query.sort)
      q.orderBy(
        'created',
        (query?.sort as string).toUpperCase() as 'ASC' | 'DESC',
      );

    q.setParameters({
      name: query.search + '%',
      category: query.category,
      in: query.in,
      notIn: query.notIn,
    });

    copy.setParameters({
      name: query.search + '%',
      category: query.category,
      in: query.in,
      notIn: query.notIn,
    });
    return {
      data: await q.getRawMany(),
      total: await copy.getCount(),
    };
  }

  public async getInfo(id: string) {
    const product = await this.productRepo.findOne({
      where: { id },
      relations: ['images'],
    });
    if (!product) throw new NotFoundException();

    const v: { review: number | null } = await this.productReviewRepo
      .createQueryBuilder('product_review')
      .select(['AVG(rating) as review'])
      .where('product_review."productId"  = :id', { id })
      .groupBy('product_review."productId"')
      .getRawOne();

    return { ...product, rating: v.review };
  }

  public async getRecommended() {
    const product = await this.productRepo
      .createQueryBuilder('product')
      .select([
        'id',
        'name',
        'description',
        'items',
        'created',
        'modified',
        'short_description as shortDescription',
        'description',
        'category',
        '"productId"',
        'avg as rating',
        'price',
      ])
      .leftJoin(
        (qb) =>
          qb
            .select([
              'product_review."productId" as "productId"',
              'AVG(rating)',
            ])
            .from(ProductReview, 'product_review')
            .groupBy('product_review."productId"'),
        'review_tbl',
        '"review_tbl"."productId" = "product"."id"',
      )
      .orderBy('rating', 'DESC')
      .getRawOne();

    if (!product) throw new NotFoundException();

    const images = await this.productImageRepo.find({
      where: {
        product: { id: product.id },
      },
    });

    return { ...product, images };
  }

  public async getProductReview(id: string) {
    const productR = await this.productReviewRepo.find({
      where: { product: { id } },
      relations: ['user'],
    });

    return productR;
  }

  public async reviewProduct(id: string, user: User, data: ReviewProductDto) {
    const product = await this.productRepo.findOne({
      where: {
        id,
      },
    });

    if (!product) throw new NotFoundException('Product not found');

    let productReview = await this.productReviewRepo.findOne({
      where: {
        user,
        product,
      },
      relations: ['user', 'product'],
    });

    productReview = !!productReview ? productReview : new ProductReview();

    productReview.comment = data.comment;
    productReview.rating = data.rate;
    productReview.product = product;
    productReview.user = user;

    await this.productReviewRepo.save(productReview);

    return;
  }

  public async createProduct({
    first,
    second,
    third,
    price,
    ...other
  }: ProductDto) {
    const product = await this.productRepo.findOne({
      where: {
        name: other.name,
      },
    });

    if (product) throw new ConflictException('Product already exist');

    let newProduct = new Product();
    newProduct = { ...newProduct, ...other, price: price.toFixed(2) };

    const prod = await this.productRepo.save(newProduct);

    await this.productImageRepo.save([
      {
        ...new ProductImages(),
        link: first,
        pos: 'first',
        product: prod,
      },
      {
        ...new ProductImages(),
        link: second,
        pos: 'second',
        product: prod,
      },
      {
        ...new ProductImages(),
        link: third,
        pos: 'third',
        product: prod,
      },
    ]);
    return;
  }

  public async updateProduct(
    id: string,
    { first, second, third, price, ...other }: UpdateProductDto,
  ) {
    let product = await this.productRepo.findOne({
      where: {
        id: id,
      },
      relations: ['images'],
    });

    if (!product) throw new ConflictException('Not found');

    if (!!other.name && other.name !== product.name) {
      const productCheck = await this.productRepo.findOne({
        where: {
          name: other.name,
        },
      });

      if (productCheck)
        throw new ConflictException('Product name already exist');
    }

    for (const i in product.images) {
      if (!!first && product.images[i].pos === 'first')
        product.images[i].link = first;
      if (!!second && product.images[i].pos === 'second')
        product.images[i].link = second;
      if (!!third && product.images[i].pos === 'third')
        product.images[i].link = third;
    }

    product = { ...product, ...other };

    if (!!price) product.price = price.toFixed(2);

    await this.productRepo.save(product);
    return;
  }
}
