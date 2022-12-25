import { ApiProperty } from '@nestjs/swagger';

import { IsArray } from 'class-validator';

export class DeleteRoleDto {
  @ApiProperty()
  @IsArray()
  ids: string[];
}
