import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UtilityPolesRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/utility-poles-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Edit Utility Pole (E2E)", () => {
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

  test("[PUT] /utility-poles/:id", async () => {
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

    const utilityPole = makeUtilityPole();
    await utilityPolesRepository.createMany([utilityPole]);

    const response = await request(app.getHttpServer())
      .put(`/utility-poles/${utilityPole.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        description: "NEW DESCRIPTION",
        unit: "KG",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Utility pole edited successfully",
        utilityPole: expect.objectContaining({
          id: utilityPole.id.toString(),
          description: "NEW DESCRIPTION",
          unit: "KG",
        }),
      }),
    );

    const utilityPoleOnDatabase = await utilityPolesRepository.findById(
      utilityPole.id.toString(),
    );
    expect(utilityPoleOnDatabase).toBeTruthy();
    expect(utilityPoleOnDatabase?.description).toBe("NEW DESCRIPTION");
    expect(utilityPoleOnDatabase?.unit).toBe("KG");
  });
});
