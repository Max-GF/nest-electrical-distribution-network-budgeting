import { ApiProperty } from "@nestjs/swagger";

export class EditPoleScrewDto {
  @ApiProperty({
    description: "The code of the pole screw",
    example: 12345,
    required: false,
  })
  code?: number;

  @ApiProperty({
    description: "The description of the pole screw",
    example: "PARAFUSO DE POSTE 16MM",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "The unit of the pole screw",
    example: "UND",
    required: false,
  })
  unit?: string;

  @ApiProperty({
    description: "The length of the pole screw in mm",
    example: 250,
    required: false,
  })
  lengthInMM?: number;
}
