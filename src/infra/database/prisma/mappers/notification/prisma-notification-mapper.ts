import { Notification as PrismaNotification } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Notification as DomainNotification } from "src/domain/notification/enterprise/entities/notification";

export class PrismaNotificationMapper {
  static toDomain(raw: PrismaNotification): DomainNotification {
    return DomainNotification.create(
      {
        recipientId: new UniqueEntityID(raw.recipientId),
        title: raw.title,
        content: raw.content,
        readAt: raw.readAt,
        createdAt: raw.createdAt,
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toPrisma(raw: DomainNotification): PrismaNotification {
    return {
      id: raw.id.toString(),
      recipientId: raw.recipientId.toString(),
      title: raw.title,
      content: raw.content,
      readAt: raw.readAt === undefined ? null : raw.readAt,
      createdAt: raw.createdAt,
    };
  }
}
