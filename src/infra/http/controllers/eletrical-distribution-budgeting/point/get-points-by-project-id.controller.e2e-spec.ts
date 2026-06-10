import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
import request from "supertest";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";
import { makeBase } from "test/factories/user-management/make-base";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { makePoint } from "test/factories/eletrical-distribution-budgeting/make-point";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";

describe("Get Points by Project ID (E2E)", () => {
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

  test("[GET] /projects/:projectId/points", async () => {
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

    const point1 = makePoint({
      projectId: project.id,
      mediumTensionEntranceCableId: cable.id,
      utilityPoleId: utilityPole.id,
    });
    await prisma.point.create({
      data: {
        id: point1.id.toString(),
        name: point1.name,
        projectId: point1.projectId.toString(),
        description: point1.description,
        mediumTensionEntranceCableId:
          point1.mediumTensionEntranceCableId?.toString(),
        utilityPoleId: point1.utilityPoleId?.toString(),
      },
    });

    const point2 = makePoint({ projectId: project.id });
    await prisma.point.create({
      data: {
        id: point2.id.toString(),
        name: point2.name,
        projectId: point2.projectId.toString(),
        description: point2.description,
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
      .get(`/projects/${project.id.toString()}/points`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body.points).toHaveLength(2);
    expect(response.body.points).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: point1.id.toString(),
          mediumTensionEntranceCable: expect.objectContaining({
            id: cable.id.toString(),
          }),
          utilityPole: expect.objectContaining({
            id: utilityPole.id.toString(),
          }),
        }),
        expect.objectContaining({
          id: point2.id.toString(),
        }),
      ]),
    );
  });
});
