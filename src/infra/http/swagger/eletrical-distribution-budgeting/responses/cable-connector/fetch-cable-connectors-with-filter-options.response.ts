import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function FetchCableConnectorsWithFilterOptionsResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Fetch cable connectors with filter options",
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "The cable connectors have been successfully fetched.",
      schema: {
        type: "object",
        properties: {
          cableConnectors: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string", example: "uuid" },
                code: { type: "number", example: 12345 },
                description: {
                  type: "string",
                  example: "CONECTOR PERFURANTE 10-95MM",
                },
                unit: { type: "string", example: "UND" },
                entranceMinValueMM: { type: "number", example: 10 },
                entranceMaxValueMM: { type: "number", example: 95 },
                exitMinValueMM: { type: "number", example: 1.5 },
                exitMaxValueMM: { type: "number", example: 10 },
              },
            },
          },
          pagination: {
            type: "object",
            properties: {
              actualPage: { type: "number", example: 1 },
              actualPageSize: { type: "number", example: 10 },
              lastPage: { type: "number", example: 5 },
            },
          },
        },
      },
    }),
  );
}
