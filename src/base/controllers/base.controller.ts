import {
  Controller,
  Delete,
  Get,
  HttpCode,
  Post,
  Patch,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('base')
@Controller('base')
export class BaseController {
  @Get()
  public async testGet() {
    return 'Hello';
  }
}
