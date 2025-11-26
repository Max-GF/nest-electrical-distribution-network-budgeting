import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function EditUtilityPoleResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Edit a utility pole",
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "The utility pole has been successfully edited.",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Utility pole edited successfully",
          },
          utilityPole: {
            type: "object",
            properties: {
              id: { type: "string", example: "uuid" },
              code: { type: "number", example: 12345 },
              description: { type: "string", example: "POSTE DE CONCRETO 11M" },
              unit: { type: "string", example: "UND" },
              strongSideSectionMultiplier: { type: "number", example: 1.5 },
              mediumVoltageLevelsCount: { type: "number", example: 3 },
              mediumVoltageStartSectionLengthInMM: {
                type: "number",
                example: 1000,
              },
              mediumVoltageSectionLengthAddBylevelInMM: {
                type: "number",
                example: 500,
              },
              lowVoltageLevelsCount: { type: "number", example: 2 },
              lowVoltageStartSectionLengthInMM: {
                type: "number",
                example: 800,
              },
              lowVoltageSectionLengthAddBylevelInMM: {
                type: "number",
                example: 400,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.NOT_FOUND,
      description: "Utility pole not found",
      schema: {
        example: {
          message: "Utility pole with id uuid not found",
        },
      },
    }),
    ApiResponse({
      status: HttpStatus.UNPROCESSABLE_ENTITY,
      description: "Invalid parameters (negative length, multiplier < 1, etc.)",
      schema: {
        example: {
          message: "Invalid parameters (negative length, multiplier < 1, etc.)",
          statusCode: 422,
          error: "Unprocessable Entity",
        },
      },
    }),
  );
}
