import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function CreateBulkOfUtilityPolesResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Create multiple utility poles",
    }),
    ApiResponse({
      status: HttpStatus.CREATED,
      description: "The utility poles have been processed.",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Utility poles processed successfully",
          },
          created: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", example: "uuid" },
                code: { type: "number", example: 12345 },
                description: {
                  type: "string",
                  example: "POSTE DE CONCRETO 11M",
                },
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
          failed: {
            type: "array",
            items: {
              type: "object",
              properties: {
                error: { type: "object" },
                utilityPole: { type: "object" },
              },
            },
          },
        },
      },
    }),
  );
}
