import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function EditCableResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Edit a cable",
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "The cable has been successfully edited.",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "Cable edited successfully" },
          cable: {
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
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: "Cable not found",
      schema: {
        example: {
          message: "Cable not found",
          statusCode: 404,
          error: "Not Found",
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: "Invalid tension level or negative section area",
      schema: {
        example: {
          message: "Invalid tension level or negative section area",
          statusCode: 422,
          error: "Unprocessable Entity",
        },
      },
    }),
  );
}
