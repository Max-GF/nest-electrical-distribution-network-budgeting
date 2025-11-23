import { Notification } from "src/domain/notification/enterprise/entities/notification";

export class NotificationPresenter {
  static toHttp(notification: Notification) {
    return {
      id: notification.id.toString(),
      title: notification.title,
      content: notification.content,
    };
  }
}
