import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CableConnectorsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cable-connectors-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Create Bulk Of Cable Connectors (E2E)", () => {
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

  test("[POST] /cable-connectors/bulk", async () => {
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
      .post("/cable-connectors/bulk")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        cableConnectors: [
          {
            code: 12345,
            description: "CONECTOR PERFURANTE 10-95MM",
            unit: "UND",
            entranceMinValueMM: 10,
            entranceMaxValueMM: 95,
            exitMinValueMM: 1.5,
            exitMaxValueMM: 10,
          },
          {
            code: 54321,
            description: "CONECTOR PERFURANTE 95-240MM",
            unit: "UND",
            entranceMinValueMM: 95,
            entranceMaxValueMM: 240,
            exitMinValueMM: 10,
            exitMaxValueMM: 35,
          },
        ],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.cableConnectors).toHaveLength(2);
    expect(response.body.cableConnectors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 12345,
        }),
        expect.objectContaining({
          code: 54321,
        }),
      ]),
    );

    const cableConnector1 = await cableConnectorsRepository.findByCode(12345);
    const cableConnector2 = await cableConnectorsRepository.findByCode(54321);

    expect(cableConnector1).toBeTruthy();
    expect(cableConnector2).toBeTruthy();
  });
});
