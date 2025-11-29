import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from "@nestjs/swagger";
import { PointWithDetailsResponse } from "./point-with-details.response";

class GetPointsByProjectIdResponseBody {
  @ApiProperty({ type: [PointWithDetailsResponse] })
  points!: PointWithDetailsResponse[];
}

export function GetPointsByProjectIdResponse() {
  return applyDecorators(
    ApiOperation({ summary: "Get points by project ID" }),
    ApiParam({
      name: "projectId",
      description: "The ID of the project to get points from",
    }),
    ApiOkResponse({
      description: "The points have been successfully retrieved.",
      type: GetPointsByProjectIdResponseBody,
    }),
    ApiBadRequestResponse({ description: "Bad Request." }),
  );
}
