import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const FetchBasesByCompanyIdResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 200,
      description: "Bases fetched successfully",
      schema: {
        type: "object",
        properties: {
          message: { type: "string", example: "Bases fetched successfully" },
          bases: {
            type: "array",
            items: {
              properties: {
                id: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
                name: { type: "string", example: "EXAMPLE COMPANY" },
                companyId: {
                  type: "string",
                  example: "123e4567-e89b-12d3-a456-426614174000",
                },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - No bases was found for this company",
      schema: {
        example: {
          message: "No bases was found for this company",
          error: "Not Found",
          statusCode: 404,
        },
      },
    })
  );
};
