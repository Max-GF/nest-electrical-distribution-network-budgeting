import { applyDecorators } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiCreatedResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { ProjectDto } from "../../dto/project/project.dto";

export function CreateProjectResponse() {
  return applyDecorators(
    ApiTags("Projects"),
    ApiOperation({ summary: "Create a new project" }),
    ApiCreatedResponse({
      description: "Project created successfully",
      type: ProjectDto,
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
    ApiConflictResponse({ description: "Project name already registered" }),
  );
}
