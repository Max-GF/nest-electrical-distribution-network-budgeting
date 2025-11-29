import { applyDecorators, HttpStatus } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { CreateBulkOfMaterialsDto } from "../../dto/material/create-bulk-of-materials.dto";

export function CreateBulkOfMaterialsResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Create a bulk of materials",
    }),
    ApiBody({
      type: CreateBulkOfMaterialsDto,
    }),
    ApiCreatedResponse({
      description: "The materials have been successfully created.",
      schema: {
        type: "object",
        properties: {
          failed: {
            type: "array",
            items: {
              type: "object",
              properties: {
                error: { type: "object" },
                material: { type: "object" },
              },
            },
          },
          created: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                code: { type: "number" },
                description: { type: "string" },
                unit: { type: "string" },
                tension: { type: "string" },
              },
            },
          },
        },
      },
    }),
    ApiBadRequestResponse({
      description: "Bad Request",
      schema: {
        type: "object",
        properties: {
          statusCode: { type: "number", example: HttpStatus.BAD_REQUEST },
          message: { type: "string", example: "Bad Request" },
          error: { type: "string", example: "Bad Request" },
        },
      },
    }),
  );
}
