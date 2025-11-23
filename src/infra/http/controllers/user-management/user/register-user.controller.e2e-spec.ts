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

describe("Register user (E2E)", () => {
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

  test("[POST] /accounts", async () => {
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

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "User created successfully",
        user: expect.objectContaining({
          name: "JOHN DOE",
          email: "JohnDoe@example.com",
          cpf: "10826051316",
        }),
      }),
    );
  });
});
