import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ProjectMaterialDto } from "../../dto/budget/project-material.dto";

export function CalculateBudgetResponse() {
  return applyDecorators(
    ApiTags("Budget"),
    ApiOperation({ summary: "Calculate budget for a list of points" }),
    ApiCreatedResponse({
      description: "Budget calculated successfully",
      type: [ProjectMaterialDto],
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
    ApiNotFoundResponse({ description: "Resource not found" }),
    ApiConflictResponse({ description: "Conflict" }),
  );
}
