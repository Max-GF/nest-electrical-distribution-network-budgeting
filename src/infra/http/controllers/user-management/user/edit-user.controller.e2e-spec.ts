import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Edit User (E2E)", () => {
  let app: INestApplication;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;

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

    await app.init();
  });

  test("[PUT] /accounts/:id", async () => {
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
    const user2 = await userFactory.makePrismaUser({
      role: UserRole.create("COMMON"),
      email: "olduseremail@email.com",
      name: "Old User Name",
      isActive: true,
      firstLogin: false,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const accessToken = accessTokenCreator.execute(user);

    const newUserProperties = {
      email: "newuseremail@email.com",
      name: "NEW USER NAME",
      isActive: false,
      role: "ADMIN",
    };

    const response = await request(app.getHttpServer())
      .put(`/accounts/${user2.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        ...newUserProperties,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "User edited successfully",
        user: expect.objectContaining({
          name: "NEW USER NAME",
          email: "NEWUSEREMAIL@EMAIL.COM",
          isActive: false,
          role: "ADMIN",
        }),
      }),
    );
  });
  test("[PUT] /companies/:id - ERROR: You are not allowed to edit user role to one higher than owr", async () => {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testBase = await baseFactory.makePrismaBase({
      companyId: testCompany.id,
    });
    const user = await userFactory.makePrismaUser({
      role: UserRole.create("COMMON"),
      isActive: true,
      firstLogin: false,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const user2 = await userFactory.makePrismaUser({
      role: UserRole.create("COMMON"),
      email: "olduseremail2@email.com",
      name: "Old User Name",
      isActive: true,
      firstLogin: false,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const accessToken = accessTokenCreator.execute(user);

    const newUserProperties = {
      email: "newuseremail@email.com",
      name: "NEW USER NAME",
      isActive: false,
      role: "ADMIN",
    };

    const response = await request(app.getHttpServer())
      .put(`/accounts/${user2.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        ...newUserProperties,
      });
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Invalid permission",
      }),
    );
  });
});
