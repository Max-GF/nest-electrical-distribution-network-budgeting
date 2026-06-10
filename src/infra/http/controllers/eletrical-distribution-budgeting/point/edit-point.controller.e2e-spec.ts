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

describe("Edit Point (E2E)", () => {
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

  test("[PUT] /points/:id", async () => {
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

    const point = makePoint({ projectId: project.id });
    await prisma.point.create({
      data: {
        id: point.id.toString(),
        name: point.name,
        projectId: point.projectId.toString(),
        description: point.description,
      },
    });

    const newCable = makeCable();
    await prisma.cable.create({
      data: {
        id: newCable.id.toString(),
        code: newCable.code,
        description: newCable.description,
        unit: newCable.unit,
        tension: newCable.tension.value,
        sectionAreaInMM: newCable.sectionAreaInMM,
      },
    });

    const newUtilityPole = makeUtilityPole();
    await prisma.utilityPole.create({
      data: {
        id: newUtilityPole.id.toString(),
        code: newUtilityPole.code,
        description: newUtilityPole.description,
        unit: newUtilityPole.unit,
        strongSideSectionMultiplier: newUtilityPole.strongSideSectionMultiplier,
        mediumVoltageLevelsCount: newUtilityPole.mediumVoltageLevelsCount,
        mediumVoltageStartSectionLengthInMM:
          newUtilityPole.mediumVoltageStartSectionLengthInMM,
        mediumVoltageSectionLengthAddBylevelInMM:
          newUtilityPole.mediumVoltageSectionLengthAddBylevelInMM,
        lowVoltageLevelsCount: newUtilityPole.lowVoltageLevelsCount,
        lowVoltageStartSectionLengthInMM:
          newUtilityPole.lowVoltageStartSectionLengthInMM,
        lowVoltageSectionLengthAddBylevelInMM:
          newUtilityPole.lowVoltageSectionLengthAddBylevelInMM,
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
      .put(`/points/${point.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        description: "New description",
        mediumTensionEntranceCableId: newCable.id.toString(),
        utilityPoleId: newUtilityPole.id.toString(),
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      point: expect.objectContaining({
        id: point.id.toString(),
        description: "New description",
        mediumTensionEntranceCableId: newCable.id.toString(),
        utilityPoleId: newUtilityPole.id.toString(),
      }),
    });

    const pointOnDatabase = await prisma.point.findUnique({
      where: {
        id: point.id.toString(),
      },
    });

    expect(pointOnDatabase).toBeTruthy();
    expect(pointOnDatabase?.description).toBe("New description");
    expect(pointOnDatabase?.mediumTensionEntranceCableId).toBe(
      newCable.id.toString(),
    );
    expect(pointOnDatabase?.utilityPoleId).toBe(newUtilityPole.id.toString());
  });
});
