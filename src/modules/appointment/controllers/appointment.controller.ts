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

import { Roles as RoleTypes } from '../../../enum';
import { Parameter } from '../../../helpers';
import { MailService } from '../../../mail/mail.service';

import { SearchUserDto, DeleteDto } from 'src/modules/base/dto';
import { AppointmentService } from '../services/appointment.service';
import {
  DeleteAppointmentDto,
  SearchAppointmentDto,
  UpdateAppointmentDto,
} from '../dto';

@ApiTags('appointments')
@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Roles(RoleTypes.ADMIN)
  @Get()
  public async getAllAppointments(@Query() data: SearchAppointmentDto) {
    return await this.appointmentService.getAppointments(data);
  }

  @Roles(RoleTypes.ADMIN)
  @Get(Parameter.id())
  public async getAppointmentInfo(
    @Param('id')
    id: string,
  ) {
    return await this.appointmentService.getAppointmentInfo(id);
  }

  @Roles(RoleTypes.ADMIN)
  @Delete()
  public async deleteAppointment(
    @Query()
    data: DeleteAppointmentDto,
  ) {
    return await this.appointmentService.deleteAppointment(data.id);
  }

  @Roles(RoleTypes.ADMIN)
  @Patch(Parameter.id())
  public async updateAppointment(
    @Param('id')
    id: string,
    @Body()
    data: UpdateAppointmentDto,
  ) {
    return await this.appointmentService.updateAppointment(id, data);
  }
}
