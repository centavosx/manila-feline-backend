import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsEnum, IsOptional, IsInt } from 'class-validator';
import { AmOrPm, Status } from 'src/entities';
import { Roles } from '../../../enum';

export class DeleteAppointmentDto {
  @ApiProperty()
  id: string[];
}
