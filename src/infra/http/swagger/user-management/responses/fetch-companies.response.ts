import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchCompaniesResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Companies fetched successfully",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Companies fetched successfully",
          },
          companies: {
            type: "array",
            items: {
              properties: {
                id: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                name: { type: "string", example: "EXAMPLE COMPANY" },
                cnpj: { type: "string", example: "12345678000190" },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - No companies was found",
      schema: {
        example: {
          message: "No companies was found",
          error: "Not Found",
          statusCode: 404,
        },
      },
    })
  );
};
