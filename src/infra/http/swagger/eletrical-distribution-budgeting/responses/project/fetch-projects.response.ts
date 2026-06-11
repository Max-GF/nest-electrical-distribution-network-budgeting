import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from "@nestjs/swagger";
import { ProjectDto } from "../../dto/project/project.dto";

class FetchProjectsResponseBody {
  @ApiProperty({ type: [ProjectDto] })
  projects!: ProjectDto[];

  @ApiProperty({
    type: "object",
    properties: {
      actualPage: { type: "number", example: 1 },
      actualPageSize: { type: "number", example: 40 },
      lastPage: { type: "number", example: 5 },
    },
  })
  pagination!: {
    actualPage: number;
    actualPageSize: number;
    lastPage: number;
  };
}

export function FetchProjectsResponse() {
  return applyDecorators(
    ApiTags("Projects"),
    ApiOperation({ summary: "Fetch projects with filters" }),
    ApiOkResponse({
      description: "Projects fetched successfully",
      type: FetchProjectsResponseBody,
    }),
    ApiBadRequestResponse({ description: "Bad Request" }),
  );
}
