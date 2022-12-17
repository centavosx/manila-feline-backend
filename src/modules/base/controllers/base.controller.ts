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
import { CreateUserDto } from '../dto/create-user.dto';
import { BaseService } from '../services/base.service';

@ApiTags('user')
@Controller('user')
export class BaseController {
  constructor(private readonly baseService: BaseService) {}

  @Post()
  public async createUser(@Body() data: CreateUserDto) {
    return await this.baseService.createUser(data);
  }
}
