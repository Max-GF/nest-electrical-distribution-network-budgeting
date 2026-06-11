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

class CalculateBudgetResponseBody {
  @ApiProperty({ type: [ProjectMaterialDto] })
  projectMaterials!: ProjectMaterialDto[];
}

export function CalculateBudgetResponse() {
  return applyDecorators(
    ApiTags("Budget"),
    ApiOperation({ summary: "Calculate budget for a list of points" }),
    ApiCreatedResponse({
      description: "Budget calculated successfully",
      type: CalculateBudgetResponseBody,
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
    ApiNotFoundResponse({ description: "Resource not found" }),
    ApiConflictResponse({ description: "Conflict" }),
  );
}
