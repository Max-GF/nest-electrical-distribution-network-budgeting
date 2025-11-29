import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from "@nestjs/swagger";
import { CableResponse } from "../cable/cable.response";
import { UtilityPoleResponse } from "../utility-pole/utility-pole.response";
import { PointResponse } from "./point.response";

class ParsedCableResponse {
  @ApiProperty({ example: true })
  isNew!: boolean;

  @ApiProperty({ type: CableResponse })
  cable!: CableResponse;
}

class ParsedLowTensionCablesResponse {
  @ApiProperty({ type: ParsedCableResponse })
  entranceCable!: ParsedCableResponse;

  @ApiProperty({ type: ParsedCableResponse, required: false })
  exitCable?: ParsedCableResponse;
}

class ParsedMediumTensionCablesResponse {
  @ApiProperty({ type: ParsedCableResponse })
  entranceCable!: ParsedCableResponse;

  @ApiProperty({ type: ParsedCableResponse, required: false })
  exitCable?: ParsedCableResponse;
}

class ParsedPointCablesResponse {
  @ApiProperty({ type: ParsedLowTensionCablesResponse, required: false })
  lowTensionCables?: ParsedLowTensionCablesResponse;

  @ApiProperty({ type: ParsedMediumTensionCablesResponse, required: false })
  mediumTensionCables?: ParsedMediumTensionCablesResponse;
}

class ParsedPointUtilityPoleResponse {
  @ApiProperty({ example: true })
  isNew!: boolean;

  @ApiProperty({ type: UtilityPoleResponse })
  utilityPole!: UtilityPoleResponse;
}

class ParsedPointGroupResponse {
  @ApiProperty({ example: "LOW" })
  tensionLevel!: "LOW" | "MEDIUM";

  @ApiProperty({ example: 1 })
  level!: number;

  // Simplified for now, as mapping the full GroupWithSeparatedItems structure is complex
  // and might require more DTOs.
  @ApiProperty({ example: "Group Name" })
  groupName!: string;
}

class ParsedUntiedMaterialResponse {
  @ApiProperty({ example: 5 })
  quantity!: number;

  @ApiProperty({ example: "Material Name" })
  materialName!: string;
}

class ParsedPointToCreateResponse {
  @ApiProperty({ type: PointResponse })
  point!: PointResponse;

  @ApiProperty({ type: ParsedPointUtilityPoleResponse })
  pointUtilityPole!: ParsedPointUtilityPoleResponse;

  @ApiProperty({ type: ParsedPointCablesResponse })
  pointCables!: ParsedPointCablesResponse;

  @ApiProperty({ type: [ParsedPointGroupResponse] })
  pointGroupsWithItems!: ParsedPointGroupResponse[];

  @ApiProperty({ type: [ParsedUntiedMaterialResponse] })
  pointUntiedMaterials!: ParsedUntiedMaterialResponse[];
}

class ValidateManyPointsResponseBody {
  @ApiProperty({ example: "Project Name" })
  projectName!: string;

  @ApiProperty({ type: [ParsedPointToCreateResponse] })
  parsedPoints!: ParsedPointToCreateResponse[];
}

export function ValidateManyPointsResponse() {
  return applyDecorators(
    ApiOperation({ summary: "Validate many points" }),
    ApiParam({
      name: "projectId",
      description: "The ID of the project to validate points for",
    }),
    ApiCreatedResponse({
      description: "The points have been successfully validated.",
      type: ValidateManyPointsResponseBody,
    }),
    ApiBadRequestResponse({ description: "Bad Request." }),
    ApiNotFoundResponse({ description: "Resource not found." }),
    ApiConflictResponse({ description: "Conflict." }),
  );
}
