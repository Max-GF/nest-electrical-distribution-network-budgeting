import { ApiPropertyOptional } from "@nestjs/swagger";

export class EditUtilityPoleDto {
  @ApiPropertyOptional({
    description: "The description of the utility pole",
    example: "POSTE DE CONCRETO 11M",
  })
  description?: string;

  @ApiPropertyOptional({
    description: "The unit of the utility pole",
    example: "UND",
  })
  unit?: string;

  @ApiPropertyOptional({
    description: "The strong side section multiplier",
    example: 1.5,
  })
  strongSideSectionMultiplier?: number;

  @ApiPropertyOptional({
    description: "The number of medium voltage levels",
    example: 3,
  })
  mediumVoltageLevelsCount?: number;

  @ApiPropertyOptional({
    description: "The start section length for medium voltage in mm",
    example: 1000,
  })
  mediumVoltageStartSectionLengthInMM?: number;

  @ApiPropertyOptional({
    description: "The section length added by level for medium voltage in mm",
    example: 500,
  })
  mediumVoltageSectionLengthAddBylevelInMM?: number;

  @ApiPropertyOptional({
    description: "The number of low voltage levels",
    example: 2,
  })
  lowVoltageLevelsCount?: number;

  @ApiPropertyOptional({
    description: "The start section length for low voltage in mm",
    example: 800,
  })
  lowVoltageStartSectionLengthInMM?: number;

  @ApiPropertyOptional({
    description: "The section length added by level for low voltage in mm",
    example: 400,
  })
  lowVoltageSectionLengthAddBylevelInMM?: number;
}
