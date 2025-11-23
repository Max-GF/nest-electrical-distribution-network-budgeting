import { ApiPropertyOptional } from "@nestjs/swagger";
import {
    IsBooleanString,
    IsOptional,
    IsString,
    Matches,
} from "class-validator";
export class FetchUsersWithFilteredOptionsDto {
  @ApiPropertyOptional({
    description: "Comma-separated list of roles",
    example: "ADMIN,COMMON",
  })
  @IsOptional()
  @IsString()
  roles?: string;

  @ApiPropertyOptional({
    description: "Comma-separated UUIDs of base IDs",
    example:
      "6a3c1c6f-6e7a-4b3f-9c60-77e1e189ef99,52b0efda-cc65-41b8-b3c7-8a6cbb01996f",
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(,([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}))*$/,
    { message: "basesIds must be a comma-separated list of UUIDs" },
  )
  basesIds?: string;

  @ApiPropertyOptional({
    description: "Comma-separated UUIDs of company IDs",
    example: "aa2a2a2a-2aa2-2aa2-2aa2-2aa2aa2aa2aa",
  })
  @IsOptional()
  @IsString()
  @Matches(
    /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})(,([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}))*$/,
    { message: "companiesIds must be a comma-separated list of UUIDs" },
  )
  companiesIds?: string;

  @ApiPropertyOptional({
    description: "Whether the user is active",
    example: "true",
  })
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @ApiPropertyOptional({
    description: "Page number (starts at 1)",
    example: "1",
    default: "1",
  })
  @IsOptional()
  @Matches(/^\d+$/, { message: "page must be a number string" })
  page?: string;

  @ApiPropertyOptional({
    description: "Items per page",
    example: "40",
    default: "40",
  })
  @IsOptional()
  @Matches(/^\d+$/, { message: "pageSize must be a number string" })
  pageSize?: string;
}
