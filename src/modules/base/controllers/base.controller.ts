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
  DeleteRoleDto,
  LoginDto,
  SearchSingle,
  SearchUserDto,
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
  @Get(Parameter.id())
  public async getUser(
    @User() user: Usertype,
    @Param('id')
    id: string,
  ) {
    const userId = id === 'me' ? user.id : id;
    return await this.baseService.getUser(userId);
  }

  @Roles(RoleTypes.ADMIN)
  @Post()
  public async createUser(@Body() data: CreateUserDto) {
    // await this.mailService.sendMail(
    //   'sseethpan098123@gmail.com',
    //   'TEST',
    //   'email',
    //   {
    //     name: 'test',
    //   },
    // );

    return await this.baseService.createUser(data);
  }

  @Post('/login')
  public async loginUser(@Body() data: LoginDto) {
    return await this.baseService.loginUser(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Get('search')
  public async searchUser(@Query() search: SearchSingle) {
    return await this.baseService.getUser(undefined, search.email);
  }

  @Roles(RoleTypes.ADMIN)
  @Put('/update-role')
  public async updateRole(@Body() data: CreateUserDto) {
    return await this.baseService.updateRole(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Patch('/remove-role')
  public async removeRole(
    @Query() query: SearchUserDto,
    @Body() data: DeleteRoleDto,
  ) {
    return await this.baseService.removeRole(data, query);
  }
}
