import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { DomainEvent } from "src/core/events/domain-event";
import { User } from "../entities/base-user";

export class UserCreatedEvent implements DomainEvent {
  public ocurredAt: Date;
  public user: User;

  constructor(user: User) {
    this.ocurredAt = new Date();
    this.user = user;
  }
  getAggregateId(): UniqueEntityID {
    return this.user.id;
  }
}
