import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PoleScrewsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/pole-screws-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Create Pole Screw (E2E)", () => {
  let app: INestApplication;
  let poleScrewsRepository: PoleScrewsRepository;
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
    poleScrewsRepository = moduleRef.get(PoleScrewsRepository);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);

    await app.init();
  });

  test("[POST] /pole-screws", async () => {
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
      .post("/pole-screws")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        code: 12345,
        description: "PARAFUSO DE POSTE 16MM",
        unit: "UND",
        lengthInMM: 250,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.poleScrew).toEqual(
      expect.objectContaining({
        code: 12345,
        description: "PARAFUSO DE POSTE 16MM",
        unit: "UND",
        lengthInMM: 250,
      }),
    );

    const poleScrewOnDatabase = await poleScrewsRepository.findByCode(12345);

    expect(poleScrewOnDatabase).toBeTruthy();
    expect(poleScrewOnDatabase?.code).toBe(12345);
  });
});
