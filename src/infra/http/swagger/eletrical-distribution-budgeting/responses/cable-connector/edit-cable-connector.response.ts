import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

export function EditCableConnectorResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Edit a cable connector",
    }),
    ApiResponse({
      status: HttpStatus.OK,
      description: "The cable connector has been successfully updated.",
      schema: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Cable connector updated successfully",
          },
          cableConnector: {
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
      },
    }),
    ApiResponse({
      status: HttpStatus.CONFLICT,
      description: "Cable connector code already registered or not found",
      schema: {
        example: {
          message: "Cable connector with code 12345 already exists",
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
          message:
            "Cable Connector entrance and exit section lengths must be greater than or equal to zero.",
          statusCode: 422,
          error: "Unprocessable Entity",
        },
      },
    }),
  );
}
