import { Injectable } from "@nestjs/common";
import { NotificationsRepository } from "src/domain/notification/application/repositories/notifications-repository";
import { Notification } from "src/domain/notification/enterprise/entities/notification";
import { PrismaNotificationMapper } from "../../mappers/notification/prisma-notification-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaNotificationsRepository implements NotificationsRepository {
  constructor(private readonly prisma: PrismaService) {}
  async create(notification: Notification): Promise<void> {
    const data = PrismaNotificationMapper.toPrisma(notification);
    await this.prisma.notification.create({ data });
  }
  async save(notification: Notification): Promise<void> {
    const data = PrismaNotificationMapper.toPrisma(notification);
    await this.prisma.notification.update({
      where: { id: notification.id.toString() },
      data,
    });
  }
  async findById(id: string): Promise<Notification | null> {
    const foundedNotification = await this.prisma.notification.findUnique({
      where: { id },
    });
    if (!foundedNotification) return null;
    return PrismaNotificationMapper.toDomain(foundedNotification);
  }
}
