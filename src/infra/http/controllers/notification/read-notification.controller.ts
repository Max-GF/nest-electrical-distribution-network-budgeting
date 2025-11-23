import {
  BadRequestException,
  Controller,
  ForbiddenException,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { ReadNotificationUseCase } from "src/domain/notification/application/use-cases/read-notification";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy";
import { NotificationPresenter } from "../../presenters/notification/notification-presenter";
import { ReadNotificationResponse } from "../../swagger/notification/responses/read-notification.response";

@ApiTags("Notification")
@Controller("/notifications/:notificationId/read")
export class ReadNotificationController {
  constructor(private readNotification: ReadNotificationUseCase) {}

  @Patch()
  @ReadNotificationResponse()
  @HttpCode(204)
  async handle(
    @CurrentUser() user: UserPayload,
    @Param("notificationId") notificationId: string,
  ): Promise<{
    notification: ReturnType<typeof NotificationPresenter.toHttp>;
  }> {
    const result = await this.readNotification.execute({
      notificationId,
      recipientId: user.sub,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return {
      notification: NotificationPresenter.toHttp(result.value.notification),
    };
  }
}
