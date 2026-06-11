import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { ProjectDto } from "../../dto/project/project.dto";

class EditProjectResponseBody {
  @ApiProperty({ example: "Project edited successfully" })
  message!: string;

  @ApiProperty({ type: ProjectDto })
  project!: ProjectDto;
}

export function EditProjectResponse() {
  return applyDecorators(
    ApiTags("Projects"),
    ApiOperation({ summary: "Edit a project" }),
    ApiOkResponse({
      description: "Project edited successfully",
      type: EditProjectResponseBody,
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
    ApiNotFoundResponse({ description: "Project not found" }),
    ApiConflictResponse({ description: "Conflict" }),
  );
}
