import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { ProjectDto } from "../../dto/project/project.dto";

export function FetchProjectsResponse() {
  return applyDecorators(
    ApiTags("Projects"),
    ApiOperation({ summary: "Fetch projects with filters" }),
    ApiOkResponse({
      description: "Projects fetched successfully",
      type: [ProjectDto],
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
  );
}
