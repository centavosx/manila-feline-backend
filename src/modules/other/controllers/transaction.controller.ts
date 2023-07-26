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
  CreateEmailDto,
  DateDto,
  ReplyMailDto,
  SearchDoctorDto,
  CreateAppointmentDto,
  VerifyAppointmentDto,
  GetAvailabilityDto,
  TimezoneDto,
  PaypalDto,
} from '../dto';
import { OtherService } from '../services/other.service';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';
import { Response } from 'express';

import { SearchUserDto, DeleteDto } from '../../base/dto';
import { TransactionService } from '../services';
import { SearchPaymentDto } from 'src/modules/base/dto/search-payments.dto';
import { User } from 'src/decorators';
import { User as Usertype } from 'src/entities';

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {
  constructor(
    private readonly otherService: TransactionService,
    private readonly mailService: MailService,
  ) {}

  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  @Get()
  public async getAll(@Query() data: SearchPaymentDto, @User() user: Usertype) {
    return await this.otherService.getAll(
      data,
      user.roles.some((v) => v.name === RoleTypes.ADMIN) ? data.id : user.id,
    );
  }

  @Roles(RoleTypes.USER, RoleTypes.ADMIN)
  @Get(':id')
  public async getOne(@Param('id') id: string) {
    return await this.otherService.getTransaction(id);
  }
}
