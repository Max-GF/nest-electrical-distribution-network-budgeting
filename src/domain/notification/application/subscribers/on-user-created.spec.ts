import { makeUser } from "test/factories/user-management/make-user";
import { InMemoryNotificationsRepository } from "test/repositories/notification/in-memory-notifications-repository";
import { InMemoryAvatarsRepository } from "test/repositories/user-management/in-memory-avatars-repository";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { InMemoryUsersRepository } from "test/repositories/user-management/in-memory-users-repository";
import { waitFor } from "test/utils/wait-for";
import { MockInstance } from "vitest";
import { SendNotificationUseCase } from "../use-cases/send-notification";
import { OnUserCreated } from "./on-user-created";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryAvatarsRepository: InMemoryAvatarsRepository;

let inMemoryNotificationsRepository: InMemoryNotificationsRepository;
let sendNotificationUseCase: SendNotificationUseCase;

let sendNewUserCreatedNotificationSpy: MockInstance;

describe("On User Created", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    inMemoryAvatarsRepository = new InMemoryAvatarsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository(
      inMemoryCompaniesRepository,
      inMemoryBasesRepository,
      inMemoryAvatarsRepository,
    );
    inMemoryNotificationsRepository = new InMemoryNotificationsRepository();
    sendNotificationUseCase = new SendNotificationUseCase(
      inMemoryNotificationsRepository,
    );
    sendNewUserCreatedNotificationSpy = vi.spyOn(
      sendNotificationUseCase,
      "execute",
    );
    new OnUserCreated(sendNotificationUseCase);
  });
  it("should send a notification when a user is created", async () => {
    const testUser = makeUser({});
    await inMemoryUsersRepository.createMany([testUser]);
    await waitFor(() => {
      expect(sendNewUserCreatedNotificationSpy).toHaveBeenCalled();
    });
  });
});
