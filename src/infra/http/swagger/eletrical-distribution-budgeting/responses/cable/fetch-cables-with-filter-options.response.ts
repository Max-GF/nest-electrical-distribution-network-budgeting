import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function FetchCablesWithFilterOptionsResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Fetch cables with filter options",
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "The cables have been successfully fetched.",
      schema: {
        type: "object",
        properties: {
          cables: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", example: "uuid" },
                code: { type: "number", example: 12345 },
                description: {
                  type: "string",
                  example: "CABO DE ALUMÍNIO NU 35MM²",
                },
                unit: { type: "string", example: "M" },
                tension: { type: "string", example: "LOW" },
                sectionAreaInMM: { type: "number", example: 35 },
              },
            },
          },
          pagination: {
            type: "object",
            properties: {
              page: { type: "number", example: 1 },
              pageSize: { type: "number", example: 20 },
              total: { type: "number", example: 100 },
              totalPages: { type: "number", example: 5 },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: "Invalid tension level",
      schema: {
        example: {
          message:
            "Invalid tension level: HIGH. Valid values are: LOW, MEDIUM.",
          statusCode: 422,
          error: "Unprocessable Entity",
        },
      },
    }),
  );
}
