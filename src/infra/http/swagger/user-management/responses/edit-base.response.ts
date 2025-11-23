import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const EditBaseResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Base edited successfully",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "Base edited successfully" },
          base: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              name: { type: "string", example: "EXAMPLE BASE" },
              companyId: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Validation error",
      schema: {
        example: {
          message: "Base name must have less than 100 characters",
          error: "Bad Request",
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - Resource not found",
      schema: {
        example: {
          message: "Base not found.",
          error: "Not Found",
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: "Conflict - Resource already exists",
      schema: {
        example: {
          message: "Base with this name already exists.",
          error: "Conflict",
          statusCode: 409,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Unauthorized - Base from another company",
      schema: {
        example: {
          message: "You are not allowed to edit a base from another company.",
          error: "Unauthorized",
          statusCode: 403,
        },
      },
    }),
  );
};
