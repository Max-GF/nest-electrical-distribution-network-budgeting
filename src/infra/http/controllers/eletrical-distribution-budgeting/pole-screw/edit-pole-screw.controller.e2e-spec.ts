import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { PoleScrewsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/pole-screws-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { makePoleScrew } from "test/factories/eletrical-distribution-budgeting/make-pole-screw";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Edit Pole Screw (E2E)", () => {
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

  test("[PUT] /pole-screws/:id", async () => {
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

    const poleScrew = makePoleScrew({
      code: 12345,
    });
    await poleScrewsRepository.createMany([poleScrew]);

    const response = await request(app.getHttpServer())
      .put(`/pole-screws/${poleScrew.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        description: "NEW DESCRIPTION",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.poleScrew).toEqual(
      expect.objectContaining({
        code: 12345,
        description: "NEW DESCRIPTION",
      }),
    );

    const poleScrewOnDatabase = await poleScrewsRepository.findByCode(12345);

    expect(poleScrewOnDatabase).toBeTruthy();
    expect(poleScrewOnDatabase?.description).toBe("NEW DESCRIPTION");
  });
});
