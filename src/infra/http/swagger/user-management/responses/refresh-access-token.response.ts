import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const RefreshAccessTokenResponse = () => {
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
      description: "Bad Request - Missing refreshToken or invalid format",
      schema: {
        example: {
          message: "Refresh token is required and must be a valid string.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: "Unauthorized - Invalid credentials or expired token",
      schema: {
        example: {
          message: "Invalid credentials or expired token",
          error: "Unauthorized",
          statusCode: 401,
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Token doesn't belong to the user",
      schema: {
        example: {
          message: "Invalid credentials",
          error: "Unauthorized",
          statusCode: 403,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Unauthorized - Invalid credentials",
      schema: {
        example: {
          message: "Invalid credentials",
          error: "Unauthorized",
          statusCode: 404,
        },
      },
    }),
    ApiResponse({
      status: 422,
      description: "Unprocessable Entity - The given refresh token doesn't have a valid format",
      schema: {
        example: {
          message: "Unprocessable Entity - The given refresh token doesn't have a valid format",
          error: "Unauthorized",
          statusCode: 422,
        },
      },
    })
  );
};
