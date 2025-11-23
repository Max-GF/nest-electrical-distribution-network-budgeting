import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const RegisterUserResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "User created successfully",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "User created successfully" },
          user: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              cpf: { type: "string", example: "12345678901" },
              name: { type: "string", example: "EXAMPLE USER" },
              email: { type: "string", example: "example@email.com" },
              role: { type: "string", example: "ADMIN" },
              baseId: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              companyId: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              isActive: { type: "boolean", example: true },
              firstLogin: { type: "boolean", example: false },
              avatarId: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
                nullable: true,
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
          message: "Password must be at least 6 characters long",
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
          message: "Given company/base/avatar was not found",
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
          message: "Email/Cpf already registered",
          error: "Conflict",
          statusCode: 409,
        },
      },
    }),
    ApiResponse({
      status: 422,
      description:
        "Unprocessable Entity - Invalid CPF | User base doesn't belong to the company",
      schema: {
        example: {
          message: "Invalid CPF | Base doesn't belong to the given company",
          error: "Unprocessable Entity",
          statusCode: 422,
        },
      },
    })
  );
};
