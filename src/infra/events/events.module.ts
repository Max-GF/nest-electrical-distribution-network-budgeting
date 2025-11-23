import { Module } from "@nestjs/common";
import { OnUserCreated } from "src/domain/notification/application/subscribers/on-user-created";
import { SendNotificationUseCase } from "src/domain/notification/application/use-cases/send-notification";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  providers: [OnUserCreated, SendNotificationUseCase],
})
export class EventsModule {}
