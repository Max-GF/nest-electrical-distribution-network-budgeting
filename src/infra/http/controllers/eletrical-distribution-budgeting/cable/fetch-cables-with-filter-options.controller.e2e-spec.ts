import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CablesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cables-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Fetch Cables With Filter Options (E2E)", () => {
  let app: INestApplication;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let cablesRepository: CablesRepository;

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
    cablesRepository = moduleRef.get(CablesRepository);

    await app.init();
  });

  test("[GET] /cables", async () => {
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

    const cable1 = makeCable({ description: "CABLE ONE" });
    const cable2 = makeCable({ description: "CABLE TWO" });
    await cablesRepository.createMany([cable1, cable2]);

    const response = await request(app.getHttpServer())
      .get("/cables")
      .query({ description: "ONE" })
      .set("Authorization", `Bearer ${accessToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        cables: expect.arrayContaining([
          expect.objectContaining({
            id: cable1.id.toString(),
            description: "CABLE ONE",
          }),
        ]),
        pagination: expect.objectContaining({
          actualPage: 1,
          actualPageSize: 1,
          lastPage: 1,
        }),
      }),
    );
  });
});
