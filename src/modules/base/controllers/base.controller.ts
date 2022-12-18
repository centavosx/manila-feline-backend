import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Patch,
  Query,
  Body,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../decorators/roles.decorator';
import { CreateUserDto } from '../dto/create-user.dto';
import { BaseService } from '../services/base.service';
import { Roles as RoleTypes } from '../../../enum';
import { MailService } from '../../../mail/mail.service';

@ApiTags('user')
@Controller('user')
export class BaseController {
  constructor(
    private readonly baseService: BaseService,
    private readonly mailService: MailService,
  ) {}

  @Post()
  // @Roles(RoleTypes.DOCTOR)
  public async createUser(@Body() data: CreateUserDto) {
    await this.mailService.sendMail(
      'sseethpan098123@gmail.com',
      'TEST',
      'email',
      {
        name: 'test',
      },
    );

    return await this.baseService.createUser(data);
  }
}
