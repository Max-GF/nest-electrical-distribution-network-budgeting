import { ApiExtraModels, ApiProperty, getSchemaPath } from "@nestjs/swagger";
import {
  GroupCableConnectorItemResponse,
  GroupMaterialItemResponse,
  GroupPoleScrewItemResponse,
} from "./group-item.response";
import { GroupResponse } from "./group.response";

@ApiExtraModels(
  GroupMaterialItemResponse,
  GroupPoleScrewItemResponse,
  GroupCableConnectorItemResponse,
)
export class GroupWithItemsResponse {
  @ApiProperty({ type: GroupResponse })
  group!: GroupResponse;

  @ApiProperty({
    type: "array",
    items: {
      oneOf: [
        { $ref: getSchemaPath(GroupMaterialItemResponse) },
        { $ref: getSchemaPath(GroupPoleScrewItemResponse) },
        { $ref: getSchemaPath(GroupCableConnectorItemResponse) },
      ],
    },
  })
  items!: (
    | GroupMaterialItemResponse
    | GroupPoleScrewItemResponse
    | GroupCableConnectorItemResponse
  )[];
}
