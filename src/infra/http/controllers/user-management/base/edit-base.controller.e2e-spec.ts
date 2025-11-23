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

describe("Edit Base (E2E)", () => {
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

  test("[PUT] /bases/:id", async () => {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testBase = await baseFactory.makePrismaBase({
      name: "UnExpected Base",
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
      .put(`/bases/${testBase.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        baseId: testBase.id.toString(),
        name: "NEW BASE NAME",
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Base edited successfully",
        base: expect.objectContaining({
          name: "NEW BASE NAME",
        }),
      }),
    );
  });
  test("[PUT] /bases/:id - ERROR: You are not allowed to edit a base from another company.", async () => {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testCompany2 = await companyFactory.makePrismaCompany({});
    const testBase = await baseFactory.makePrismaBase({
      name: "UnExpected Base",
      companyId: testCompany2.id,
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
      .put(`/bases/${testBase.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        baseId: testBase.id.toString(),
        name: "NEW BASE NAME",
      });
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "You are not allowed to edit a base from another company.",
      }),
    );
  });
});
