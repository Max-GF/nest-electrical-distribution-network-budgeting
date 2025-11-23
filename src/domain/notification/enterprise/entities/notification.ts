import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Optional } from "src/core/types/optional";

export interface NotificationProps {
  recipientId: UniqueEntityID;
  title: string;
  content: string;
  readAt?: Date | null;
  createdAt: Date;
}

export class Notification extends Entity<NotificationProps> {
  static create(
    props: Optional<NotificationProps, "createdAt">,
    id?: UniqueEntityID,
  ) {
    const notification = new Notification(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );

    return notification;
  }

  get recipientId() {
    return this.props.recipientId;
  }

  get title() {
    return this.props.title;
  }

  get content() {
    return this.props.content;
  }

  get readAt() {
    return this.props.readAt;
  }

  get createdAt() {
    return this.props.createdAt;
  }

  read() {
    this.props.readAt = new Date();
  }
}
