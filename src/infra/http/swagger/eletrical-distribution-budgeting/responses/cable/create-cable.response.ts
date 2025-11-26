import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function CreateCableResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Create a new cable",
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "The cable has been successfully created.",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "Cable created successfully" },
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
      status: HttpStatus.CONFLICT,
      description: "Cable code already registered",
      schema: {
        example: {
          message: "Cable with code 12345 already exists",
          statusCode: 409,
          error: "Conflict",
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
