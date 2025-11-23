import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { hash } from "bcryptjs";
import { Cpf } from "src/domain/user-management/enterprise/entities/value-objects/cpf";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Refresh access token (E2E)", () => {
  let app: INestApplication;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [CompanyFactory, BaseFactory, UserFactory],
    }).compile();

    app = moduleRef.createNestApplication();

    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);

    await app.init();
  });

  test("[POST] /refresh-access-token", async () => {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testBase = await baseFactory.makePrismaBase({
      companyId: testCompany.id,
    });
    await userFactory.makePrismaUser({
      cpf: Cpf.create("12345678900"),
      name: "John Doe",
      email: "johndoe@example.com",
      password: await hash("123456", 8),
      role: UserRole.create("ADMIN"),
      isActive: true,
      firstLogin: false,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const authenticateResponse = await request(app.getHttpServer())
      .post("/authenticate")
      .send({
        email: "johndoe@example.com",
        password: "123456",
      });
    expect(authenticateResponse.statusCode).toBe(201);

    const response = await request(app.getHttpServer())
      .post("/refresh-access-token")
      .send({
        refreshToken: authenticateResponse.body.refreshToken,
      });
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
  });
  test("[POST] /refresh-access-token - Error when try to refresh with same token twice", async () => {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testBase = await baseFactory.makePrismaBase({
      companyId: testCompany.id,
    });
    await userFactory.makePrismaUser({
      cpf: Cpf.create("12345678901"),
      name: "John Doe 2",
      email: "johndoe2@example.com",
      password: await hash("123456", 8),
      role: UserRole.create("ADMIN"),
      isActive: true,
      firstLogin: false,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const authenticateResponse = await request(app.getHttpServer())
      .post("/authenticate")
      .send({
        email: "johndoe@example.com",
        password: "123456",
      });
    expect(authenticateResponse.statusCode).toBe(201);

    await request(app.getHttpServer()).post("/refresh-access-token").send({
      refreshToken: authenticateResponse.body.refreshToken,
    });
    const response = await request(app.getHttpServer())
      .post("/refresh-access-token")
      .send({
        refreshToken: authenticateResponse.body.refreshToken,
      });
    console.log(response.body);
    expect(response.statusCode).toBe(422);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "This token has already been used and revoked.",
      }),
    );
  });
});
