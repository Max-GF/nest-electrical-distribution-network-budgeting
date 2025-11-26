import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function FetchPoleScrewsWithFilterOptionsResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Fetch pole screws with filter options",
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "The pole screws have been successfully fetched.",
      schema: {
        type: "object",
        properties: {
          poleScrews: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", example: "uuid" },
                code: { type: "number", example: 12345 },
                description: {
                  type: "string",
                  example: "PARAFUSO DE POSTE 16MM",
                },
                unit: { type: "string", example: "UND" },
                lengthInMM: { type: "number", example: 250 },
              },
            },
          },
          pagination: {
            type: "object",
            properties: {
              actualPage: { type: "number", example: 1 },
              actualPageSize: { type: "number", example: 10 },
              lastPage: { type: "number", example: 5 },
            },
          },
        },
      },
    }),
  );
}
