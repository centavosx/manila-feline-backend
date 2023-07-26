import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
  IsNumber,
  IsNotEmpty,
} from 'class-validator';
import { AmOrPm, Status } from '../../../entities';

export class UpdateAppointmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsUUID()
  serviceId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(Status)
  status?: Status;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEnum(AmOrPm)
  time?: AmOrPm;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  date?: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timeZone: string;
}
