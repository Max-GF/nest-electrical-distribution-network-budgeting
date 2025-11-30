import { applyDecorators } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiConflictResponse,
    ApiNotFoundResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { ProjectDto } from "../../dto/project/project.dto";

export function EditProjectResponse() {
  return applyDecorators(
    ApiTags("Projects"),
    ApiOperation({ summary: "Edit a project" }),
    ApiOkResponse({
      description: "Project edited successfully",
      type: ProjectDto,
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
    ApiNotFoundResponse({ description: "Project not found" }),
    ApiConflictResponse({ description: "Conflict" }),
  );
}
