import { ApiProperty } from '@nestjs/swagger';

import { IsArray } from 'class-validator';

type TimeSetterProps = [
  string[],
  string[],
  string[],
  string[],
  string[],
  string[],
  string[],
];

export class TimeSetterDto {
  @ApiProperty()
  @IsArray()
  time: TimeSetterProps;
}
