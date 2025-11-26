import { ApiProperty } from "@nestjs/swagger";

export class CreateUtilityPoleDto {
  @ApiProperty({
    description: "The code of the utility pole",
    example: 12345,
  })
  code!: number;

  @ApiProperty({
    description: "The description of the utility pole",
    example: "POSTE DE CONCRETO 11M",
  })
  description!: string;

  @ApiProperty({
    description: "The unit of the utility pole",
    example: "UND",
  })
  unit!: string;

  @ApiProperty({
    description: "The strong side section multiplier",
    example: 1.5,
  })
  strongSideSectionMultiplier!: number;

  @ApiProperty({
    description: "The number of medium voltage levels",
    example: 3,
  })
  mediumVoltageLevelsCount!: number;

  @ApiProperty({
    description: "The start section length for medium voltage in mm",
    example: 1000,
  })
  mediumVoltageStartSectionLengthInMM!: number;

  @ApiProperty({
    description: "The section length added by level for medium voltage in mm",
    example: 500,
  })
  mediumVoltageSectionLengthAddBylevelInMM!: number;

  @ApiProperty({
    description: "The number of low voltage levels",
    example: 2,
  })
  lowVoltageLevelsCount!: number;

  @ApiProperty({
    description: "The start section length for low voltage in mm",
    example: 800,
  })
  lowVoltageStartSectionLengthInMM!: number;

  @ApiProperty({
    description: "The section length added by level for low voltage in mm",
    example: 400,
  })
  lowVoltageSectionLengthAddBylevelInMM!: number;
}
