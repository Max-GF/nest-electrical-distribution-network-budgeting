import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { NotificationFactory } from "test/factories/notification/make-notification";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Register user (E2E)", () => {
  let app: INestApplication;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let notificationFactory: NotificationFactory;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        AccessTokenCreator,
        CompanyFactory,
        BaseFactory,
        UserFactory,
        NotificationFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    notificationFactory = moduleRef.get(NotificationFactory);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    prismaService = moduleRef.get(PrismaService);

    await app.init();
  });

  test("[PATCH] /notifications/:notificationId/read", async () => {
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
    const newUserNotification =
      await notificationFactory.makePrismaNotification({
        recipientId: user.id,
      });
    const accessToken = accessTokenCreator.execute(user);
    const response = await request(app.getHttpServer())
      .patch(`/notifications/${newUserNotification.id.toString()}/read`)
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

    expect(response.statusCode).toBe(204);
    const prismaNotification = await prismaService.notification.findFirst({
      where: {
        id: newUserNotification.id.toString(),
      },
    });
    expect(prismaNotification).toEqual(
      expect.objectContaining({
        id: newUserNotification.id.toString(),
        readAt: expect.any(Date),
      }),
    );
  });
});
