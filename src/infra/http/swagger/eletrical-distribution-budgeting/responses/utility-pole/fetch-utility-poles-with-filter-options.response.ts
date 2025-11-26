import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function FetchUtilityPolesWithFilterOptionsResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Fetch utility poles with filter options",
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "The utility poles have been successfully fetched.",
      schema: {
        type: "object",
        properties: {
          utilityPoles: {
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
          pagination: {
            type: "object",
            properties: {
              actualPage: { type: "number", example: 1 },
              actualPageSize: { type: "number", example: 20 },
              lastPage: { type: "number", example: 100 },
            },
          },
        },
      },
    }),
  );
}
