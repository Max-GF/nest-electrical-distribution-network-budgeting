import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const CreateBaseResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Base created successfully",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "Base created successfully" },
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
          message: "Base name must be between 6 and 100 characters",
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
          message: "Given company was not found",
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
          message: "Base name already registered",
          error: "Conflict",
          statusCode: 409,
        },
      },
    })
  );
};
