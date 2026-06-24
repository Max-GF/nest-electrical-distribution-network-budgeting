import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
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

describe("Build Project Budget (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
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
    prisma = moduleRef.get(PrismaService);
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

  test("[POST] /projects/:projectId/budget/build", async () => {
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
      .post(`/projects/${project.id.toString()}/budget/build`)
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

    const projectOnDatabase = await prisma.project.findUnique({
      where: {
        id: project.id.toString(),
      },
    });

    expect(projectOnDatabase?.budgetAlreadyCalculated).toBe(true);

    const projectMaterials = await prisma.projectMaterial.findMany({
      where: {
        projectId: project.id.toString(),
      },
    });

    expect(projectMaterials.length).toBeGreaterThan(0);
  });
});
