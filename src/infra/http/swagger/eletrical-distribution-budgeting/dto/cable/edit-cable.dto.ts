import { ApiPropertyOptional } from "@nestjs/swagger";

export class EditCableDto {
  @ApiPropertyOptional({
    description: "The description of the cable",
    example: "CABO DE ALUMÍNIO NU 35MM²",
  })
  description?: string;

  @ApiPropertyOptional({
    description: "The unit of the cable",
    example: "M",
  })
  unit?: string;

  @ApiPropertyOptional({
    description: "The tension level of the cable",
    example: "LOW",
    enum: ["LOW", "MEDIUM"],
  })
  tension?: string;

  @ApiPropertyOptional({
    description: "The section area of the cable in mm²",
    example: 35,
  })
  sectionAreaInMM?: number;
}
