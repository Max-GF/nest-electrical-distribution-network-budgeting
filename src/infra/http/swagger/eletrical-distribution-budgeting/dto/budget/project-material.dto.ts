import { ApiProperty } from "@nestjs/swagger";

export class ProjectMaterialGroupSpecsDto {
  @ApiProperty()
  groupId!: string;

  @ApiProperty()
  utilityPoleLevel!: number;

  @ApiProperty({ enum: ["LOW", "MEDIUM"] })
  tensionLevel!: "LOW" | "MEDIUM";
}

export class ProjectMaterialDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  projectId!: string;

  @ApiProperty()
  itemId!: string;

  @ApiProperty({
    enum: ["material", "poleScrew", "cableConnector", "utilityPole", "cable"],
  })
  itemType!:
    | "material"
    | "poleScrew"
    | "cableConnector"
    | "utilityPole"
    | "cable";

  @ApiProperty()
  quantity!: number;

  @ApiProperty({ required: false })
  pointId?: string;

  @ApiProperty({ required: false, type: ProjectMaterialGroupSpecsDto })
  groupSpecs?: ProjectMaterialGroupSpecsDto;
}
