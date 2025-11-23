import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const EditCompanyResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Company edited successfully",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "Company edited successfully" },
          company: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              name: { type: "string", example: "EXAMPLE COMPANY" },
              cnpj: { type: "string", example: "00000000000191" },
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
          message: "Company name must have less than 100 characters",
          error: "Bad Request",
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Unauthorized - You are not allowed to edit this company",
      schema: {
        example: {
          message: "You cannot edit a company you don't belong to",
          error: "Unauthorized",
          statusCode: 403,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - Resource not found",
      schema: {
        example: {
          message: "Company not found",
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
          message:
            "Company name already registered | Company CNPJ already registered",
          error: "Conflict",
          statusCode: 409,
        },
      },
    }),
    ApiResponse({
      status: 422,
      description: "Unprocessable Entity - Invalid CNPJ",
      schema: {
        example: {
          message: "Invalid CNPJ",
          error: "Unprocessable Entity",
          statusCode: 422,
        },
      },
    })
  );
};
