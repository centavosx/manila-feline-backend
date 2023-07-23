import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsNumber,
  ValidateNested,
} from 'class-validator';

class Product {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  price: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  qty: number;
}

export class BuyDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsArray()
  @ValidateNested()
  @Type(() => Product)
  data: Product[];

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  timeZone: string;
}
