import { ApiProperty } from "@nestjs/swagger";

export class EditCableConnectorDto {
  @ApiProperty({
    description: "The code of the cable connector",
    example: 12345,
    required: false,
  })
  code?: number;

  @ApiProperty({
    description: "The description of the cable connector",
    example: "CONECTOR PERFURANTE 10-95MM",
    required: false,
  })
  description?: string;

  @ApiProperty({
    description: "The unit of the cable connector",
    example: "UND",
    required: false,
  })
  unit?: string;

  @ApiProperty({
    description: "The minimum entrance value in mm",
    example: 10,
    required: false,
  })
  entranceMinValueMM?: number;

  @ApiProperty({
    description: "The maximum entrance value in mm",
    example: 95,
    required: false,
  })
  entranceMaxValueMM?: number;

  @ApiProperty({
    description: "The minimum exit value in mm",
    example: 1.5,
    required: false,
  })
  exitMinValueMM?: number;

  @ApiProperty({
    description: "The maximum exit value in mm",
    example: 10,
    required: false,
  })
  exitMaxValueMM?: number;
}
