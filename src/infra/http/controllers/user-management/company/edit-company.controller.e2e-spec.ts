import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { Cnpj } from "src/domain/user-management/enterprise/entities/value-objects/cnpj";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Edit Company (E2E)", () => {
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

  test("[PUT] /companies/:id", async () => {
    const testCompany = await companyFactory.makePrismaCompany({
      name: "OLD COMPANY NAME",
      cnpj: Cnpj.create("01860395000165"),
    });
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

    const newCompanyProperties = {
      name: "NEW COMPANY NAME",
      cnpj: Cnpj.create("32546141000109"),
    };

    const response = await request(app.getHttpServer())
      .put(`/companies/${testCompany.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: newCompanyProperties.name,
        cnpj: newCompanyProperties.cnpj.value,
      });
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Company edited successfully",
        company: expect.objectContaining({
          name: "NEW COMPANY NAME",
          cnpj: "32546141000109",
        }),
      }),
    );
  });
  test("[PUT] /companies/:id - ERROR: You are not allowed to edit company that you not belong", async () => {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testCompany2 = await companyFactory.makePrismaCompany({});
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

    const newCompanyProperties = {
      name: "NEW COMPANY NAME",
      cnpj: Cnpj.create("32546141000109"),
    };

    const response = await request(app.getHttpServer())
      .put(`/companies/${testCompany2.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: newCompanyProperties.name,
        cnpj: newCompanyProperties.cnpj.value,
      });
    expect(response.statusCode).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "You cannot edit a company you don't belong to",
      }),
    );
  });
});
