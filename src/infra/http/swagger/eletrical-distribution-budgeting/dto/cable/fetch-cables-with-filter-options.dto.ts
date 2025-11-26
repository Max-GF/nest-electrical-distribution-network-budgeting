import { ApiPropertyOptional } from "@nestjs/swagger";

export class FetchCablesWithFilterOptionsDto {
  @ApiPropertyOptional({
    description: "The codes of the cables to filter",
    example: [12345, 67890],
    type: [Number],
  })
  codes?: number[];

  @ApiPropertyOptional({
    description: "The description of the cable to filter",
    example: "ALUMÍNIO",
  })
  description?: string;

  @ApiPropertyOptional({
    description: "The tension level of the cable to filter",
    example: "LOW",
    enum: ["LOW", "MEDIUM"],
  })
  tension?: string;

  @ApiPropertyOptional({
    description: "The maximum section area of the cable in mm²",
    example: 50,
  })
  maxSectionAreaInMM?: number;

  @ApiPropertyOptional({
    description: "The minimum section area of the cable in mm²",
    example: 10,
  })
  minSectionAreaInMM?: number;

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
