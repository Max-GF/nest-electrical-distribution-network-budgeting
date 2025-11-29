import { applyDecorators } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
} from "@nestjs/swagger";
import { EditPointDto } from "../../dto/point/edit-point.dto";
import { PointResponse } from "./point.response";

class EditPointResponseBody {
  @ApiProperty({ type: PointResponse })
  point!: PointResponse;
}

export function EditPointResponse() {
  return applyDecorators(
    ApiOperation({ summary: "Edit a point" }),
    ApiParam({ name: "id", description: "The ID of the point to edit" }),
    ApiBody({ type: EditPointDto }),
    ApiOkResponse({
      description: "The point has been successfully edited.",
      type: EditPointResponseBody,
    }),
    ApiBadRequestResponse({ description: "Bad Request." }),
    ApiNotFoundResponse({ description: "Resource not found." }),
    ApiConflictResponse({ description: "Conflict." }),
  );
}
