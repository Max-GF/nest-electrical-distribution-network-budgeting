import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { DomainEvents } from "src/core/events/domain-events";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";
import { waitFor } from "test/utils/wait-for";
import { PrismaService } from "../database/prisma/prisma.service";

describe("On user created Event (E2E)", () => {
  let app: INestApplication;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [AccessTokenCreator, CompanyFactory, BaseFactory, UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    prismaService = moduleRef.get(PrismaService);

    DomainEvents.shouldRun = true; // Enable domain events for this test
    await app.init();
  });

  it("Should be able to send a notification on user is created", async () => {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testBase = await baseFactory.makePrismaBase({
      companyId: testCompany.id,
    });
    const user = await userFactory.makePrismaUser({
      role: UserRole.create("ADMIN"),
      isActive: true,
      firstLogin: false,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const accessToken = accessTokenCreator.execute(user);
    const response = await request(app.getHttpServer())
      .post("/accounts")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        baseId: testBase.id.toString(),
        companyId: testCompany.id.toString(),
        email: "JohnDoe@example.com",
        password: "123456",
        name: "John Doe",
        role: "ADMIN",
        cpf: "108.260.513-16",
      });

    await waitFor(async () => {
      const notificationOnDatabase = await prismaService.notification.findFirst(
        {
          where: {
            recipientId: response.body.user.id,
          },
        },
      );
      expect(notificationOnDatabase).toEqual(
        expect.objectContaining({
          recipientId: response.body.user.id,
          title: "Welcome!",
          content: `Hello ${response.body.user.name}, welcome to our platform!`,
        }),
      );
    });
  });
});
