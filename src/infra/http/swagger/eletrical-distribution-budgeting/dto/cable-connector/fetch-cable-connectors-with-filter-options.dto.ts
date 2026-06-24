import { ApiProperty } from "@nestjs/swagger";

export class FetchCableConnectorsWithFilterOptionsDto {
  @ApiProperty({
    description: "The codes of the cable connectors",
    example: [12345],
    required: false,
    type: [Number],
  })
  codes?: number[];

  @ApiProperty({
    description: "The description of the cable connector",
    example: "CONECTOR",
    required: false,
  })
  description?: string;

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
