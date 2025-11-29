import { applyDecorators, HttpStatus } from "@nestjs/common";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
} from "@nestjs/swagger";
import { CreateMaterialDto } from "../../dto/material/create-material.dto";

export function CreateMaterialResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Create a new material",
    }),
    ApiBody({
      type: CreateMaterialDto,
    }),
    ApiCreatedResponse({
      description: "The material has been successfully created.",
      schema: {
        type: "object",
        properties: {
          material: {
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
