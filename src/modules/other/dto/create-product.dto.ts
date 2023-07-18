import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsInt, IsNotEmpty, IsOptional } from 'class-validator';

const isInteger = (value: any): boolean => /^\+?(0|[1-9]\d*)$/.test(value);
const toNumber = (value: any): number => {
  return isInteger(value.value) ? parseInt(value.value) : value.value;
};

export class ProductDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  first: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  second: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  third: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  shortDescription: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty()
  @IsNotEmpty()
  @Transform(toNumber)
  @IsInt()
  items: number;
}

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  first: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  second: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  third: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  shortDescription: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  category: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  items: number;
}
