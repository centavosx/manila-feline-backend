import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsArray } from 'class-validator';
import { FindOptionsOrderValue } from 'typeorm';

const isInteger = (value: any): boolean => /^\+?(0|[1-9]\d*)$/.test(value);
const toNumber = (value: any): number => {
  return isInteger(value.value) ? parseInt(value.value) : value.value;
};

export class SearchProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  page?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(toNumber)
  @IsInt()
  limit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  sort?: FindOptionsOrderValue;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  category?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  inArr?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  notIn?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  range?: string[];
}
