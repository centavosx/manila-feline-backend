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
import {
  CreateUserDto,
  DeleteDto,
  IdDto,
  LoginDto,
  SearchSingle,
  SearchUserDto,
  TimeSetterDto,
} from '../dto';
import { BaseService } from '../services/base.service';
import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';
import { User } from '../../../decorators';
import { Role, User as Usertype } from '../../../entities';

@ApiTags('user')
@Controller('user')
export class BaseController {
  constructor(
    private readonly baseService: BaseService,
    private readonly mailService: MailService,
  ) {}

  @Roles(RoleTypes.ADMIN)
  @Get()
  public async getAll(@Query() queryParameters: SearchUserDto) {
    return await this.baseService.getAll(queryParameters);
  }

  @Roles(RoleTypes.ADMIN)
  @Get(Parameter.id() + '/information')
  public async getUser(
    @User() user: Usertype,
    @Param('id')
    id: string,
  ) {
    const userId = id === 'me' ? user.id : id;
    return await this.baseService.getUser(userId);
  }

  @Post()
  public async createUser(@Body() data: CreateUserDto) {
    return await this.baseService.createUser(data);
  }

  @Post('/login')
  public async loginUser(@Body() data: LoginDto) {
    return await this.baseService.loginUser(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Post(Parameter.id() + '/service')
  public async addService(
    @Param('id')
    id: string,
    @Body() data: IdDto,
  ) {
    return await this.baseService.addService(id, data);
  }

  @Roles(RoleTypes.ADMIN)
  @Delete(Parameter.id() + '/service')
  public async deleteService(
    @Param('id')
    id: string,
    @Query() data: IdDto,
  ) {
    return await this.baseService.deleteService(id, data);
  }

  @Roles(RoleTypes.ADMIN)
  @Get('search')
  public async searchUser(@Query() search: SearchSingle) {
    return await this.baseService.getUser(undefined, search.email);
  }

  @Roles(RoleTypes.ADMIN)
  @Put('/role')
  public async updateRole(@Body() data: CreateUserDto) {
    return await this.baseService.updateRole(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Patch('/role')
  public async removeRole(
    @Query() query: SearchUserDto,
    @Body() data: DeleteDto,
  ) {
    return await this.baseService.removeRole(data, query);
  }

  @Roles(RoleTypes.ADMIN)
  @Put(Parameter.id() + '/availability')
  public async updateAvailability(
    @Param('id') id: string,
    @Body() data: TimeSetterDto,
  ) {
    return await this.baseService.updateAvailability(id, data);
  }
}
