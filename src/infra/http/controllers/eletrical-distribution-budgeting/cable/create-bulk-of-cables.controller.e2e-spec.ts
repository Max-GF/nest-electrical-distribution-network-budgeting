import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { CablesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/cables-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Create Bulk Of Cables (E2E)", () => {
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

  test("[POST] /cables/bulk", async () => {
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
      .post("/cables/bulk")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        cables: [
          {
            code: 12345,
            description: "CABO DE ALUMÍNIO NU 35MM²",
            unit: "M",
            tension: "LOW",
            sectionAreaInMM: 35,
          },
          {
            code: 67890,
            description: "CABO DE ALUMÍNIO NU 50MM²",
            unit: "M",
            tension: "MEDIUM",
            sectionAreaInMM: 50,
          },
        ],
      });

    const createdCables = await cablesRepository.findByIds([
      response.body.created[0].id,
      response.body.created[1].id,
    ]);
    expect(response.statusCode).toBe(201);
    expect(createdCables).toHaveLength(2);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Cables processed successfully",
        created: expect.arrayContaining([
          expect.objectContaining({
            code: 12345,
            description: "CABO DE ALUMÍNIO NU 35MM²",
          }),
          expect.objectContaining({
            code: 67890,
            description: "CABO DE ALUMÍNIO NU 50MM²",
          }),
        ]),
        failed: [],
      }),
    );
  });
});
