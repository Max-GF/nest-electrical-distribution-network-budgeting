import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";

class MaterialDetailsResponse {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "12345" })
  code!: string;

  @ApiProperty({ example: "Poste de Concreto" })
  description!: string;

  @ApiProperty({ example: "UN" })
  unit!: string;

  @ApiProperty({ example: "MT" })
  tension!: string;
}

export class GroupItemBaseResponse {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  groupItemId!: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  groupId!: string;

  @ApiProperty({ example: 1 })
  quantity!: number;

  @ApiProperty({ example: 0 })
  addByPhase!: number;

  @ApiProperty({ example: "Item description", required: false })
  description?: string;
}

export class GroupMaterialItemResponse extends GroupItemBaseResponse {
  @ApiProperty({ example: "material" })
  type!: "material";

  @ApiProperty({ type: MaterialDetailsResponse })
  material!: MaterialDetailsResponse;
}

export class GroupPoleScrewItemResponse extends GroupItemBaseResponse {
  @ApiProperty({ example: "poleScrew" })
  type!: "poleScrew";

  @ApiProperty({ example: 0.5 })
  lengthAdd!: number;
}

export class GroupCableConnectorItemResponse extends GroupItemBaseResponse {
  @ApiProperty({ example: "cableConnector" })
  type!: "cableConnector";

  @ApiProperty({ example: 16 })
  localCableSectionInMM!: number;

  @ApiProperty({ example: false, required: false })
  oneSideConnector?: boolean;
}

@ApiExtraModels(
  GroupMaterialItemResponse,
  GroupPoleScrewItemResponse,
  GroupCableConnectorItemResponse,
)
export class GroupItemResponse {
  @ApiProperty({
    oneOf: [
      { $ref: getSchemaPath(GroupMaterialItemResponse) },
      { $ref: getSchemaPath(GroupPoleScrewItemResponse) },
      { $ref: getSchemaPath(GroupCableConnectorItemResponse) },
    ],
  })
  item!:
    | GroupMaterialItemResponse
    | GroupPoleScrewItemResponse
    | GroupCableConnectorItemResponse;
}
