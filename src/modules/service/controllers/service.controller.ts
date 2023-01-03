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
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { Param } from '@nestjs/common/decorators';
import { Roles } from '../../../decorators/roles.decorator';

import { ServiceService } from '../services';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';
import { User } from '../../../decorators';
import { Role, User as Usertype } from '../../../entities';
import { CreateServiceDto, SearchServiceDto } from '../dto';
import { DeleteDto } from 'src/modules/base/dto';

@ApiTags('service')
@Controller('service')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Get()
  public async getAll(@Query() queryParameters: SearchServiceDto) {
    return await this.serviceService.getAll(queryParameters);
  }

  @Roles(RoleTypes.ADMIN)
  @Post()
  public async addService(@Body() data: CreateServiceDto) {
    return await this.serviceService.addService(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Post('delete')
  public async deleteServices(@Body() data: DeleteDto) {
    return await this.serviceService.deleteServices(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Get('search')
  public async getService(@Query() queryParameters: SearchServiceDto) {
    return await this.serviceService.getService(queryParameters);
  }
}
