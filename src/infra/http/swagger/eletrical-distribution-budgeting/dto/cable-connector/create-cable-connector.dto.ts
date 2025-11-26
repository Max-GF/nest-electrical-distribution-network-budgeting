import { ApiProperty } from "@nestjs/swagger";

export class CreateCableConnectorDto {
  @ApiProperty({
    description: "The code of the cable connector",
    example: 12345,
  })
  code!: number;

  @ApiProperty({
    description: "The description of the cable connector",
    example: "CONECTOR PERFURANTE 10-95MM",
  })
  description!: string;

  @ApiProperty({
    description: "The unit of the cable connector",
    example: "UND",
  })
  unit!: string;

  @ApiProperty({
    description: "The minimum entrance value in mm",
    example: 10,
  })
  entranceMinValueMM!: number;

  @ApiProperty({
    description: "The maximum entrance value in mm",
    example: 95,
  })
  entranceMaxValueMM!: number;

  @ApiProperty({
    description: "The minimum exit value in mm",
    example: 1.5,
  })
  exitMinValueMM!: number;

  @ApiProperty({
    description: "The maximum exit value in mm",
    example: 10,
  })
  exitMaxValueMM!: number;
}
