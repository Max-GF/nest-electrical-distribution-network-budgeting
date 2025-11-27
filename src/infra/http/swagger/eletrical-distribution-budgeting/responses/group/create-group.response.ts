import { ApiProperty } from "@nestjs/swagger";
import { GroupResponse } from "./group.response";

export class CreateGroupResponse {
  @ApiProperty({ type: GroupResponse })
  group!: GroupResponse;
}
