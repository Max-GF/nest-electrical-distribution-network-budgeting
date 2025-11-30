import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class FetchProjectsDto {
  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  @IsOptional()
  @Transform(({ value }) => value === "true" || value === true)
  budgetAlreadyCalculated?: boolean;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  calculatedDateBefore?: Date;

  @ApiProperty({ required: false })
  @IsDate()
  @IsOptional()
  @Transform(({ value }) => new Date(value))
  calculatedDateAfter?: Date;

  @ApiProperty({ required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  page?: number;

  @ApiProperty({ required: false, default: 40 })
  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  pageSize?: number;
}
