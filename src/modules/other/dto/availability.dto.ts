import { ApiProperty } from '@nestjs/swagger';

import { IsNotEmpty, IsString } from 'class-validator';

export class GetAvailabilityDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timeZone: string;
}
