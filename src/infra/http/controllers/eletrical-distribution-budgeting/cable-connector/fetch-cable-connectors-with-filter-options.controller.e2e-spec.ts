import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CableConnectorsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Fetch Cable Connectors With Filter Options (E2E)", () => {
  let app: INestApplication;
  let cableConnectorsRepository: CableConnectorsRepository;
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
    cableConnectorsRepository = moduleRef.get(CableConnectorsRepository);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);

    await app.init();
  });

  test("[GET] /cable-connectors", async () => {
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

    const cableConnector1 = makeCableConnector({
      code: 12345,
      description: "CONECTOR 1",
    });
    const cableConnector2 = makeCableConnector({
      code: 54321,
      description: "CONECTOR 2",
    });
    await cableConnectorsRepository.createMany([
      cableConnector1,
      cableConnector2,
    ]);

    const response = await request(app.getHttpServer())
      .get("/cable-connectors")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({
        page: 1,
        pageSize: 10,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.cableConnectors).toHaveLength(2);
    expect(response.body.pagination).toEqual({
      actualPage: 1,
      actualPageSize: 2,
      lastPage: 1,
    });
  });
});
