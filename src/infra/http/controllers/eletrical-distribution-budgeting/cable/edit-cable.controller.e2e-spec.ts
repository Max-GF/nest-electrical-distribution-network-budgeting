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

describe("Edit Cable (E2E)", () => {
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

  test("[PUT] /cables/:id", async () => {
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

    const cable = makeCable();
    await cablesRepository.createMany([cable]);

    const response = await request(app.getHttpServer())
      .put(`/cables/${cable.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        description: "NEW DESCRIPTION",
        unit: "KG",
      });

    const updatedCable = await cablesRepository.findById(cable.id.toString());

    expect(response.statusCode).toBe(200);
    expect(updatedCable).toBeDefined();
    expect(updatedCable?.description).toBe("NEW DESCRIPTION");
    expect(updatedCable?.unit).toBe("KG");
    expect(response.body).toEqual(
      expect.objectContaining({
        message: "Cable edited successfully",
        cable: expect.objectContaining({
          id: cable.id.toString(),
          description: "NEW DESCRIPTION",
          unit: "KG",
        }),
      }),
    );
  });
});
