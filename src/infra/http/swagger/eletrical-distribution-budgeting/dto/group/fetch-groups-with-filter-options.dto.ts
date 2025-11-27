import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class FetchGroupsWithFilterOptionsDto {
  @ApiPropertyOptional({
    description: "The name of the group",
    example: "Group Name",
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: "The tension of the group",
    example: "MT",
  })
  @IsString()
  @IsOptional()
  tension?: string;

  @ApiPropertyOptional({
    description: "The description of the group",
    example: "Group Description",
  })
  @IsString()
  @IsOptional()
  description?: string;

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
