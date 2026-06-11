import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { ProjectDto } from "../../dto/project/project.dto";

class CreateProjectResponseBody {
  @ApiProperty({ example: "Project created successfully" })
  message!: string;

  @ApiProperty({ type: ProjectDto })
  project!: ProjectDto;
}

export function CreateProjectResponse() {
  return applyDecorators(
    ApiTags("Projects"),
    ApiOperation({ summary: "Create a new project" }),
    ApiCreatedResponse({
      description: "Project created successfully",
      type: CreateProjectResponseBody,
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
    ApiConflictResponse({ description: "Project name already registered" }),
  );
}
