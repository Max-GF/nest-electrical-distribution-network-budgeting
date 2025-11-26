import { applyDecorators, HttpStatus } from "@nestjs/common";
import {
    ApiBadRequestResponse,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
} from "@nestjs/swagger";
import { EditMaterialDto } from "../../dto/material/edit-material.dto";

export function EditMaterialResponse() {
  return applyDecorators(
    ApiOperation({
      summary: "Edit a material",
    }),
    ApiBody({
      type: EditMaterialDto,
    }),
    ApiOkResponse({
      description: "The material has been successfully edited.",
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
