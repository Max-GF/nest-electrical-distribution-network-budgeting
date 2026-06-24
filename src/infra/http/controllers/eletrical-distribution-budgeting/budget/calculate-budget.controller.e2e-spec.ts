import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { CalculateBudgetPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/calculate-budget-presenter";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { CableFactory } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { CableConnectorFactory } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { PoleScrewFactory } from "test/factories/eletrical-distribution-budgeting/make-pole-screw";
import { ProjectFactory } from "test/factories/eletrical-distribution-budgeting/make-project";
import { UtilityPoleFactory } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Calculate Budget (E2E)", () => {
  let app: INestApplication;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let projectFactory: ProjectFactory;
  let cableFactory: CableFactory;
  let utilityPoleFactory: UtilityPoleFactory;
  let poleScrewFactory: PoleScrewFactory;
  let cableConnectorFactory: CableConnectorFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        AccessTokenCreator,
        CompanyFactory,
        BaseFactory,
        UserFactory,
        ProjectFactory,
        CableFactory,
        UtilityPoleFactory,
        PoleScrewFactory,
        CableConnectorFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    projectFactory = moduleRef.get(ProjectFactory);
    cableFactory = moduleRef.get(CableFactory);
    utilityPoleFactory = moduleRef.get(UtilityPoleFactory);
    poleScrewFactory = moduleRef.get(PoleScrewFactory);
    cableConnectorFactory = moduleRef.get(CableConnectorFactory);

    await app.init();
  });

  test("[POST] /projects/:projectId/budget/calculate", async () => {
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

    const project = await projectFactory.makePrismaProject({
      budgetAlreadyCalculated: false,
    });

    const cable = await cableFactory.makePrismaCable({});
    const utilityPole = await utilityPoleFactory.makePrismaUtilityPole({});

    await poleScrewFactory.makePrismaPoleScrew({
      lengthInMM: 500,
    });

    await cableConnectorFactory.makePrismaCableConnector({
      entranceCablesOptionsIds: [cable.id],
      exitCablesOptionsIds: [],
    });

    const response = await request(app.getHttpServer())
      .post(`/projects/${project.id.toString()}/budget/calculate`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        points: [
          {
            name: "Point 1",
            pointUtilityPole: {
              isNew: true,
              utilityPoleId: utilityPole.id.toString(),
            },
            pointCables: {
              lowTensionCables: {
                entranceCable: {
                  isNew: true,
                  cableId: cable.id.toString(),
                },
              },
            },
          },
        ],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.projectMaterials).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          projectId: project.id.toString(),
        }),
      ]),
    );

    const materials = response.body.projectMaterials as ReturnType<
      typeof CalculateBudgetPresenter.toHTTP
    >[];
    const hasPole = materials.some(
      (m) =>
        m.itemType === "utilityPole" && m.itemId === utilityPole.id.toString(),
    );
    const hasCable = materials.some(
      (m) => m.itemType === "cable" && m.itemId === cable.id.toString(),
    );

    expect(hasPole).toBeTruthy();
    expect(hasCable).toBeTruthy();
  });
});
