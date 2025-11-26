import { applyDecorators, HttpStatus } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiOperation,
} from "@nestjs/swagger";

export function FetchMaterialsWithFilterOptionsResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Fetch materials with filter options",
    }),
    ApiOkResponse({
      description: "The materials have been successfully fetched.",
      schema: {
        type: "object",
        properties: {
          materials: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                code: { type: "number" },
                description: { type: "string" },
                unit: { type: "string" },
                tension: { type: "string" },
              },
            },
          },
          pagination: {
            type: "object",
            properties: {
              actualPage: { type: "number" },
              actualPageSize: { type: "number" },
              lastPage: { type: "number" },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: "Bad Request",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: HttpStatus.BAD_REQUEST },
          message: { type: "string", example: "Bad Request" },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
  );
}
