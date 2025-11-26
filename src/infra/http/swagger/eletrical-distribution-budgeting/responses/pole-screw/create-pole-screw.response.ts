import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function CreatePoleScrewResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Create a new pole screw",
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "The pole screw has been successfully created.",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Pole screw created successfully",
          },
          poleScrew: {
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
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: "Pole screw code already registered",
      schema: {
        example: {
          message: "Pole screw with code 12345 already exists",
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
