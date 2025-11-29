import { ApiProperty } from "@nestjs/swagger";
import { CableResponse } from "../cable/cable.response";
import { UtilityPoleResponse } from "../utility-pole/utility-pole.response";

export class PointWithDetailsResponse {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "P1" })
  name!: string;

  @ApiProperty({ example: "Point Description", required: false })
  description?: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  projectId!: string;

  @ApiProperty({ type: CableResponse, required: false })
  mediumTensionEntranceCable?: CableResponse;

  @ApiProperty({ type: CableResponse, required: false })
  mediumTensionExitCable?: CableResponse;

  @ApiProperty({ type: CableResponse, required: false })
  lowTensionEntranceCable?: CableResponse;

  @ApiProperty({ type: CableResponse, required: false })
  lowTensionExitCable?: CableResponse;

  @ApiProperty({ type: UtilityPoleResponse, required: false })
  utilityPole?: UtilityPoleResponse;
}
