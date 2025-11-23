import { Injectable } from "@nestjs/common";
import { DomainEvents } from "src/core/events/domain-events";
import { EventHandler } from "src/core/events/event-handler";
import { UserCreatedEvent } from "src/domain/user-management/enterprise/events/user-created-event";
import { SendNotificationUseCase } from "../use-cases/send-notification";

@Injectable()
export class OnUserCreated implements EventHandler {
  constructor(private readonly sendNotification: SendNotificationUseCase) {
    this.setupSubscriptions();
  }

  setupSubscriptions(): void {
    DomainEvents.register(
      this.sendNewUserNotification.bind(this),
      UserCreatedEvent.name,
    );
  }

  private async sendNewUserNotification(
    event: UserCreatedEvent,
  ): Promise<void> {
    console.log(`Hello ${event.user.name}, welcome to our platform!`); // For visual test purposes
    await this.sendNotification.execute({
      recipientId: event.user.id.toString(),
      title: "Welcome!",
      content: `Hello ${event.user.name}, welcome to our platform!`,
    });
  }
}
