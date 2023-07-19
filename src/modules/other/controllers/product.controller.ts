import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Patch,
  Query,
  Body,
  Put,
  ForbiddenException,
  Res,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';
import {
  SearchProductDto,
  ReviewProductDto,
  ProductDto,
  UpdateProductDto,
} from '../dto';
import { OtherService } from '../services/other.service';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';
import { Response } from 'express';

import { SearchUserDto, DeleteDto } from '../../base/dto';
import { ProductService } from '../services';
import { User as UserDecorator } from '../../../decorators';
import { User } from '../../../entities';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly otherService: OtherService,
    private readonly productService: ProductService,
    private readonly mailService: MailService,
  ) {}

  // @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  @Get()
  public async getProducts(@Query() queries: SearchProductDto) {
    return await this.productService.getAll(queries);
  }

  // @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  @Get(Parameter.id())
  public async getProductInfo(@Param('id') id: string) {
    return await this.productService.getInfo(id);
  }

  // @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  @Get(Parameter.id() + '/review')
  public async getProductReview(@Param('id') id: string) {
    return await this.productService.getProductReview(id);
  }

  // @Roles(RoleTypes.ADMIN)
  @Post()
  public async createProduct(@Body() data: ProductDto) {
    return await this.productService.createProduct(data);
  }

  @Patch(Parameter.id())
  public async updateProduct(
    @Param('id') id: string,
    @Body() data: UpdateProductDto,
  ) {
    return await this.productService.updateProduct(id, data);
  }

  @Roles(RoleTypes.USER)
  @Put('review/' + Parameter.id())
  public async reviewProduct(
    @Param('id') id: string,
    @UserDecorator() user: User,
    @Body() data: ReviewProductDto,
  ) {
    return await this.productService.reviewProduct(id, user, data);
  }
}
