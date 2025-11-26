import { ApiProperty } from "@nestjs/swagger";

export class FetchPoleScrewsWithFilterOptionsDto {
  @ApiProperty({
    description: "The codes of the pole screws",
    example: [12345],
    required: false,
    type: [Number],
  })
  codes?: number[];

  @ApiProperty({
    description: "The description of the pole screw",
    example: "PARAFUSO",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "The minimum length in mm",
    example: 100,
    required: false,
  })
  minLengthInMM?: number;

  @ApiProperty({
    description: "The maximum length in mm",
    example: 500,
    required: false,
  })
  maxLengthInMM?: number;

  @ApiProperty({
    description: "The page number",
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: "The page size",
    example: 10,
    required: false,
  })
  pageSize?: number;
}
