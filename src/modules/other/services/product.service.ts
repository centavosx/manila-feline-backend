import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Appointment,
  Product,
  ProductImages,
  ProductReview,
  User,
  UserPayment,
  UserTransaction,
} from '../../../entities';
import { DataSource, Repository } from 'typeorm';

import {
  BuyDto,
  ProductDto,
  ReviewProductDto,
  SearchProductDto,
  UpdateProductDto,
} from '../dto';

import { MailService } from '../../../mail/mail.service';
import { DeleteDto, ResponseDto } from '../../base/dto';

import { Paypal } from '../../../paypal';

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
      q.andWhere('category IN (:...category)');
      copy.andWhere('category IN (:...category)');
    }

    if (!!query.inArr) {
      q.andWhere('"product".id IN (:...inArr)');
      copy.andWhere('"product".id IN (:...inArr)');
    }

    if (!!query.notIn) {
      q.andWhere('"product".id NOT IN (:...notIn)');
      copy.andWhere('"product".id NOT IN (:...notIn)');
    }

    if (!!query.range) {
      q.andWhere(`TO_NUMBER(
        "product".price,
        '999999999999999999999999.99') >= :minValue`);
      q.andWhere(`TO_NUMBER(
        "product".price,
        '999999999999999999999999.99') <= :maxValue`);
      copy.andWhere(`TO_NUMBER(
        "product".price,
        '999999999999999999999999.99') >= :minValue`);
      copy.andWhere(`TO_NUMBER(
        "product".price,
        '999999999999999999999999.99') <= :maxValue`);
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
      inArr: query.inArr,
      notIn: query.notIn,
      ...(!!query.range
        ? { minValue: Number(query.range[0]), maxValue: Number(query.range[1]) }
        : {}),
    });

    copy.setParameters({
      name: query.search + '%',
      category: query.category,
      inArr: query.inArr,
      notIn: query.notIn,
      ...(!!query.range
        ? { minValue: Number(query.range[0]), maxValue: Number(query.range[1]) }
        : {}),
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

    return { ...product, rating: v?.review ?? 0 };
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

  public async buyProduct(user: User, { data, timeZone }: BuyDto) {
    let total = 0;
    const saved = await this.userTransaction.save(
      data.map((v) => {
        const trans = new UserTransaction();
        trans.itemNumber = v.qty;
        trans.user = user;
        trans.product = { ...new Product(), id: v.id };
        trans.price = v.price;
        total += Number(v.price) * v.qty;
        return trans;
      }),
    );

    const paypal = new Paypal({
      items: saved.map((v) => ({
        name: 'buy',
        sku: v.id,
        price: v.price,
        currency: 'PHP',
        quantity: v.itemNumber,
      })),
      currency: 'PHP',
      price: total.toFixed(2),
      successUrl: process.env.API_URL + 'other/transactions/success',
      cancelledUrl: process.env.API_URL + 'other/transactions/canceled',
      description: 'buy',
      state: timeZone,
    });
    const link = (await paypal.create().pay()).link;

    return link;
  }
  public async deleteProduct(data: DeleteDto) {
    return await this.productRepo.delete(data.ids);
  }
}
