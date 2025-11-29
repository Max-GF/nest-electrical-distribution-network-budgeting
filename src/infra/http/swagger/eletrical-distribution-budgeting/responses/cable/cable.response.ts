import { ApiProperty } from "@nestjs/swagger";

export class CableResponse {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: 12345 })
  code!: number;

  @ApiProperty({ example: "Cable Description" })
  description!: string;

  @ApiProperty({ example: "M" })
  unit!: string;

  @ApiProperty({ example: "LOW" })
  tension!: string;

  @ApiProperty({ example: 50 })
  sectionAreaInMM!: number;
}
