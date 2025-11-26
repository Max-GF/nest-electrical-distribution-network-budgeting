import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function CreateBulkOfPoleScrewsResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Create a bulk of pole screws",
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "The pole screws have been successfully created.",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Pole screws created successfully",
          },
          poleScrews: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", example: "uuid" },
                code: { type: "number", example: 12345 },
                description: {
                  type: "string",
                  example: "PARAFUSO DE POSTE 16MM",
                },
                unit: { type: "string", example: "UND" },
                lengthInMM: { type: "number", example: 250 },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: "Some pole screws codes already registered",
      schema: {
        example: {
          message: "Some pole screws codes already registered",
          statusCode: 409,
          error: "Conflict",
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: "Invalid parameters (negative length)",
      schema: {
        example: {
          message: "Pole Screw length must be greater than zero",
          statusCode: 422,
          error: "Unprocessable Entity",
        },
      },
    }),
  );
}
