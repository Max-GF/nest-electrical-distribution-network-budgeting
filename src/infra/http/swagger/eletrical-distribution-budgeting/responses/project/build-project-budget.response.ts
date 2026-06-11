import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { ProjectMaterialDto } from "../../dto/budget/project-material.dto";

class BuildProjectBudgetResponseBody {
  @ApiProperty({ type: [ProjectMaterialDto] })
  projectMaterials!: ProjectMaterialDto[];
}

export function BuildProjectBudgetResponse() {
  return applyDecorators(
    ApiTags("Projects"),
    ApiOperation({ summary: "Build project budget (calculate and save)" }),
    ApiCreatedResponse({
      description: "Project budget built successfully",
      type: BuildProjectBudgetResponseBody,
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
    ApiNotFoundResponse({ description: "Resource not found" }),
    ApiConflictResponse({ description: "Conflict" }),
  );
}
