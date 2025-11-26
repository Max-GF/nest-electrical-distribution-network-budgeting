import { ApiPropertyOptional } from "@nestjs/swagger";

export class FetchUtilityPolesWithFilterOptionsDto {
  @ApiPropertyOptional({
    description: "The codes of the utility poles to filter",
    example: [12345, 67890],
    type: [Number],
  })
  codes?: number[];

  @ApiPropertyOptional({
    description: "The description of the utility pole to filter",
    example: "CONCRETO",
  })
  description?: string;

  @ApiPropertyOptional({
    description: "The minimum count for medium voltage levels",
    example: 1,
  })
  minimumCountForMediumVoltageLevels?: number;

  @ApiPropertyOptional({
    description: "The minimum count for low voltage levels",
    example: 1,
  })
  minimumCountForLowVoltageLevels?: number;

  @ApiPropertyOptional({
    description: "The page number",
    example: 1,
    default: 1,
  })
  page?: number;

  @ApiPropertyOptional({
    description: "The number of items per page",
    example: 20,
    default: 20,
  })
  pageSize?: number;
}
