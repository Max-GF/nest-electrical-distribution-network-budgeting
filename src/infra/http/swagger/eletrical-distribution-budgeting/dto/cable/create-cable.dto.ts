import { ApiProperty } from "@nestjs/swagger";

export class CreateCableDto {
  @ApiProperty({
    description: "The code of the cable",
    example: 12345,
  })
  code!: number;

  @ApiProperty({
    description: "The description of the cable",
    example: "CABO DE ALUMÍNIO NU 35MM²",
  })
  description!: string;

  @ApiProperty({
    description: "The unit of the cable",
    example: "M",
  })
  unit!: string;

  @ApiProperty({
    description: "The tension level of the cable",
    example: "LOW",
    enum: ["LOW", "MEDIUM"],
  })
  tension!: string;

  @ApiProperty({
    description: "The section area of the cable in mm²",
    example: 35,
  })
  sectionAreaInMM!: number;
}
