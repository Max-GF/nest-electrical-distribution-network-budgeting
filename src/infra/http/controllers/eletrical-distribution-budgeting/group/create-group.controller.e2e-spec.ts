import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { GroupsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/groups-repository";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { CableFactory } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Create Group (E2E)", () => {
  let app: INestApplication;
  let groupsRepository: GroupsRepository;
  let materialsRepository: MaterialsRepository;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let cableFactory: CableFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        AccessTokenCreator,
        CompanyFactory,
        BaseFactory,
        UserFactory,
        CableFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    groupsRepository = moduleRef.get(GroupsRepository);
    materialsRepository = moduleRef.get(MaterialsRepository);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    cableFactory = moduleRef.get(CableFactory);

    await app.init();
  });

  test("[POST] /groups", async () => {
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

    const material = makeMaterial();
    await materialsRepository.createMany([material]);
    const cable = await cableFactory.makePrismaCable({});

    const response = await request(app.getHttpServer())
      .post("/groups")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Group 1",
        description: "Group Description",
        tension: "MEDIUM",
        items: [
          {
            type: "material",
            quantity: 1,
            addByPhase: 0,
            description: "Item Description",
            materialId: material.id.toString(),
          },

          {
            type: "cableConnector",
            quantity: 2,
            addByPhase: 1,
            description: "Conector com cabo local",
            localCableId: cable.id.toString(),
            oneSideConnector: false,
          },
        ],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      group: expect.objectContaining({
        name: "GROUP 1",
        description: "GROUP DESCRIPTION",
        tension: "MEDIUM",
      }),
    });

    const groupOnDatabase = await groupsRepository.findByName("GROUP 1");
    expect(groupOnDatabase).toBeTruthy();
  });
});
