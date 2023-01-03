import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { AmOrPm } from 'src/entities';

export class CreateAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  serviceId: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @IsEnum(AmOrPm)
  time: AmOrPm;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message: string;
}

export class VerifyAppointmentDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  verification: string;
}
