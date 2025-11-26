import { ApiProperty } from "@nestjs/swagger";

export class CreatePoleScrewDto {
  @ApiProperty({
    description: "The code of the pole screw",
    example: 12345,
  })
  code!: number;

  @ApiProperty({
    description: "The description of the pole screw",
    example: "PARAFUSO DE POSTE 16MM",
  })
  description!: string;

  @ApiProperty({
    description: "The unit of the pole screw",
    example: "UND",
  })
  unit!: string;

  @ApiProperty({
    description: "The length of the pole screw in mm",
    example: 250,
  })
  lengthInMM!: number;
}
