import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const UploadAndCreateUserAvatarResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 201,
      description: "Avatar uploaded successfully",
      schema: {
        type: "object",
        properties: {
          userAvatar: {
            type: "object",
            properties: {
              id: {
                type: "string",
                example: "123e4567-e89b-12d3-a456-426614174000",
              },
              title: { type: "string", example: "Title example" },
              url: {
                type: "string",
                example: "https://example.com/avatar.png",
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 415,
      description: "Unsupported Media Type - Invalid file type",
      schema: {
        example: {
          message: "Invalid file type",
          error: "Unsupported Media Type",
          statusCode: 415,
        },
      },
    })
  );
};
