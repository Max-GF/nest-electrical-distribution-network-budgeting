import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const AuthenticateUserResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "User authenticated successfully",
      schema: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          refreshToken: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Validation error",
      schema: {
        example: {
          message: "Invalid CPF or email",
          error: "Bad Request",
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - Invalid credentials",
      schema: {
        example: {
          message: "Invalid credentials",
          error: "Unauthorized",
          statusCode: 401,
        },
      },
    })
  );
};
