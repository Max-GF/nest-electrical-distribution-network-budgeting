import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UtilityPolesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/utility-poles-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Create Bulk Of Utility Poles (E2E)", () => {
  let app: INestApplication;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let utilityPolesRepository: UtilityPolesRepository;

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
    utilityPolesRepository = moduleRef.get(UtilityPolesRepository);

    await app.init();
  });

  test("[POST] /utility-poles/bulk", async () => {
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
      .post("/utility-poles/bulk")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        utilityPoles: [
          {
            code: 12345,
            description: "POSTE DE CONCRETO 11M",
            unit: "UND",
            strongSideSectionMultiplier: 1.5,
            mediumVoltageLevelsCount: 3,
            mediumVoltageStartSectionLengthInMM: 1000,
            mediumVoltageSectionLengthAddBylevelInMM: 500,
            lowVoltageLevelsCount: 2,
            lowVoltageStartSectionLengthInMM: 800,
            lowVoltageSectionLengthAddBylevelInMM: 400,
          },
          {
            code: 67890,
            description: "POSTE DE CONCRETO 12M",
            unit: "UND",
            strongSideSectionMultiplier: 1.5,
            mediumVoltageLevelsCount: 3,
            mediumVoltageStartSectionLengthInMM: 1000,
            mediumVoltageSectionLengthAddBylevelInMM: 500,
            lowVoltageLevelsCount: 2,
            lowVoltageStartSectionLengthInMM: 800,
            lowVoltageSectionLengthAddBylevelInMM: 400,
          },
        ],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Utility poles processed successfully",
        created: expect.arrayContaining([
          expect.objectContaining({
            code: 12345,
            description: "POSTE DE CONCRETO 11M",
          }),
          expect.objectContaining({
            code: 67890,
            description: "POSTE DE CONCRETO 12M",
          }),
        ]),
        failed: [],
      }),
    );

    const utilityPole1 = await utilityPolesRepository.findByCode(12345);
    expect(utilityPole1).toBeTruthy();
    expect(utilityPole1?.description).toBe("POSTE DE CONCRETO 11M");

    const utilityPole2 = await utilityPolesRepository.findByCode(67890);
    expect(utilityPole2).toBeTruthy();
    expect(utilityPole2?.description).toBe("POSTE DE CONCRETO 12M");
  });
});
