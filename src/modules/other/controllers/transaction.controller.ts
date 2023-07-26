import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';

import { Roles as RoleTypes } from '../../../enum';

import { MailService } from '../../../mail/mail.service';

import { TransactionService } from '../services';
import { SearchPaymentDto } from '../../base/dto/search-payments.dto';
import { User } from '../../../decorators';
import { User as Usertype } from '../../../entities';

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
