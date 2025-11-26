import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function CreateBulkOfCablesResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Create multiple cables",
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "The cables have been processed.",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "Cables processed successfully" },
          created: {
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
          failed: {
            type: "array",
            items: {
              type: "object",
              properties: {
                error: { type: "object" },
                cable: { type: "object" },
              },
            },
          },
        },
      },
    }),
  );
}
