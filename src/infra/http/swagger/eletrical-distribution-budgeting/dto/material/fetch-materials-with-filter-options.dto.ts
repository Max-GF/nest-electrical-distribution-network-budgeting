import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class FetchMaterialsWithFilterOptionsDto {
  @ApiPropertyOptional({
    description: "The codes of the materials",
    example: [12345],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map(Number);
    }
    return value.split(",").map(Number);
  })
  codes?: number[];

  @ApiPropertyOptional({
    description: "The description of the material",
    example: "Material Description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "The tension of the material",
    example: "MT",
  })
  @IsString()
  @IsOptional()
  tension?: string;

  @ApiPropertyOptional({
    description: "The page number",
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  page?: number;

  @ApiPropertyOptional({
    description: "The page size",
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  pageSize?: number;
}
