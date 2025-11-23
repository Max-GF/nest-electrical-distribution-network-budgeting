import { applyDecorators } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export const ReadNotificationResponse = () => {
  return applyDecorators(
    ApiResponse({
      status: 204,
      description: "Notification founded and marked as read",
      schema: {
        type: "object",
        properties: {
          notification: {
            type: "string",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: "Unauthorized - Notification from another user",
      schema: {
        example: {
          message: "You cannot read this notification.",
          error: "Unauthorized",
          statusCode: 403,
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: "Not Found - Notification not found",
      schema: {
        example: {
          message: "Notification not found.",
          error: "Not Found",
          statusCode: 404,
        },
      },
    })
  );
};
