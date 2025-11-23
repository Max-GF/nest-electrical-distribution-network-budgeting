import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchUsersWithFilteredOptionsResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Users fetched successfully",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "Users fetched successfully" },
          users: {
            type: "array",
            items: {
              properties: {
                id: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                cpf: { type: "string", example: "12345678901" },
                name: { type: "string", example: "EXAMPLE USER" },
                email: { type: "string", example: "email@example.com" },
                role: { type: "string", example: "ADMIN" },

                base: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                    name: { type: "string", example: "EXAMPLE BASE" },
                  },
                },
                company: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                    name: { type: "string", example: "EXAMPLE COMPANY" },
                    cnpj: { type: "string", example: "12345678000190" },
                  },
                },

                isActive: { type: "boolean", example: true },
                firstLogin: { type: "boolean", example: false },

                avatar: {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                    title: { type: "string", example: "EXAMPLE AVATAR" },
                    url: {
                      type: "string",
                      example: "https://example.com/avatar.png",
                    },
                  },
                  nullable: true,
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: "Bad Request - Page parameters must be greater than 0",
      schema: {
        example: {
          message:
            "Page must be greater than 0. | pageSize must be greater than 0.",
          error: "Bad Request",
          statusCode: 400,
        },
      },
    }),
    ApiResponse({
      status: 422,
      description: "Unprocessable Entity - One of the given roles is invalid",
      schema: {
        example: {
          message: "Invalid roles: [INVALID_ROLE_EXAMPLE]",
          error: "Unprocessable Entity",
          statusCode: 422,
        },
      },
    })
  );
};
