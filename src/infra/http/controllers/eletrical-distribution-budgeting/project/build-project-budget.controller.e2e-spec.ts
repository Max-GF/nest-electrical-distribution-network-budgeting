import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
import request from "supertest";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { makePoleScrew } from "test/factories/eletrical-distribution-budgeting/make-pole-screw";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";

describe("Build Project Budget (E2E)", () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: JwtService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
    }).compile();

    app = moduleRef.createNestApplication();
    prisma = moduleRef.get(PrismaService);
    jwt = moduleRef.get(JwtService);

    await app.init();
  });

  test("[POST] /projects/:projectId/budget/build", async () => {
    const company = makeCompany();
    await prisma.company.create({
      data: {
        id: company.id.toString(),
        name: company.name,
        cnpj: company.cnpj.value,
      },
    });

    const base = makeBase({ companyId: company.id });
    await prisma.base.create({
      data: {
        id: base.id.toString(),
        name: base.name,
        companyId: base.companyId.toString(),
      },
    });

    const user = makeUser({ companyId: company.id, baseId: base.id });
    await prisma.user.create({
      data: {
        id: user.id.toString(),
        name: user.name,
        email: user.email,
        password: user.password,
        cpf: user.cpf.value,
        role: user.role.value,
        companyId: user.companyId.toString(),
        baseId: user.baseId.toString(),
      },
    });

    const project = makeProject({ budgetAlreadyCalculated: false });
    await prisma.project.create({
      data: {
        id: project.id.toString(),
        name: project.name,
        description: project.description,
        budgetAlreadyCalculated: project.budgetAlreadyCalculated,
        lastBudgetCalculatedAt: project.lastBudgetCalculatedAt,
      },
    });

    const cable = makeCable();
    await prisma.cable.create({
      data: {
        id: cable.id.toString(),
        code: cable.code,
        description: cable.description,
        unit: cable.unit,
        tension: cable.tension.value,
        sectionAreaInMM: cable.sectionAreaInMM,
      },
    });

    const utilityPole = makeUtilityPole();
    await prisma.utilityPole.create({
      data: {
        id: utilityPole.id.toString(),
        code: utilityPole.code,
        description: utilityPole.description,
        unit: utilityPole.unit,
        strongSideSectionMultiplier: utilityPole.strongSideSectionMultiplier,
        mediumVoltageLevelsCount: utilityPole.mediumVoltageLevelsCount,
        mediumVoltageStartSectionLengthInMM:
          utilityPole.mediumVoltageStartSectionLengthInMM,
        mediumVoltageSectionLengthAddBylevelInMM:
          utilityPole.mediumVoltageSectionLengthAddBylevelInMM,
        lowVoltageLevelsCount: utilityPole.lowVoltageLevelsCount,
        lowVoltageStartSectionLengthInMM:
          utilityPole.lowVoltageStartSectionLengthInMM,
        lowVoltageSectionLengthAddBylevelInMM:
          utilityPole.lowVoltageSectionLengthAddBylevelInMM,
      },
    });

    const poleScrew = makePoleScrew();
    await prisma.poleScrew.create({
      data: {
        id: poleScrew.id.toString(),
        code: poleScrew.code,
        description: poleScrew.description,
        unit: poleScrew.unit,
        lengthInMM: poleScrew.lengthInMM,
      },
    });

    const cableConnector = makeCableConnector();
    await prisma.cableConnector.create({
      data: {
        id: cableConnector.id.toString(),
        code: cableConnector.code,
        description: cableConnector.description,
        unit: cableConnector.unit,
        entranceMinValueMM: cableConnector.entranceMinValueMM,
        entranceMaxValueMM: cableConnector.entranceMaxValueMM,
        exitMinValueMM: cableConnector.exitMinValueMM,
        exitMaxValueMM: cableConnector.exitMaxValueMM,
      },
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      role: user.role.value,
      baseId: user.baseId.toString(),
      companyId: user.companyId.toString(),
      type: "accessToken",
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
    expect(response.body).toEqual(
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
