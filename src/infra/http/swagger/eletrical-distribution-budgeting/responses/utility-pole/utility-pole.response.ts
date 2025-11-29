import { ApiProperty } from "@nestjs/swagger";

export class UtilityPoleResponse {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: 12345 })
  code!: number;

  @ApiProperty({ example: "Utility Pole Description" })
  description!: string;

  @ApiProperty({ example: "UND" })
  unit!: string;

  @ApiProperty({ example: 1.5 })
  strongSideSectionMultiplier!: number;

  @ApiProperty({ example: 3 })
  mediumVoltageLevelsCount!: number;

  @ApiProperty({ example: 1000 })
  mediumVoltageStartSectionLengthInMM!: number;

  @ApiProperty({ example: 500 })
  mediumVoltageSectionLengthAddBylevelInMM!: number;

  @ApiProperty({ example: 2 })
  lowVoltageLevelsCount!: number;

  @ApiProperty({ example: 800 })
  lowVoltageStartSectionLengthInMM!: number;

  @ApiProperty({ example: 400 })
  lowVoltageSectionLengthAddBylevelInMM!: number;
}
