import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { Notification } from "../../enterprise/entities/notification";
import { NotificationsRepository } from "../repositories/notifications-repository";

interface ReadNotificationUseCaseRequest {
  recipientId: string;
  notificationId: string;
}

type ReadNotificationUseCaseResponse = Either<
  ResourceNotFoundError | NotAllowedError,
  {
    notification: Notification;
  }
>;

@Injectable()
export class ReadNotificationUseCase {
  constructor(private notificationsRepository: NotificationsRepository) {}

  async execute({
    recipientId,
    notificationId,
  }: ReadNotificationUseCaseRequest): Promise<ReadNotificationUseCaseResponse> {
    const notification =
      await this.notificationsRepository.findById(notificationId);

    if (!notification) {
      return left(new ResourceNotFoundError("Notification not found."));
    }

    if (recipientId !== notification.recipientId.toString()) {
      return left(new NotAllowedError("You cannot read this notification."));
    }

    notification.read();

    await this.notificationsRepository.save(notification);

    return right({ notification });
  }
}
