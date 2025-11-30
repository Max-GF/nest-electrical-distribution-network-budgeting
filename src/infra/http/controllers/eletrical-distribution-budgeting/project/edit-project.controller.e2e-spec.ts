import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
import request from "supertest";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";

describe("Edit Project (E2E)", () => {
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

  test("[PUT] /projects/:id", async () => {
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

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      role: user.role.value,
      baseId: user.baseId.toString(),
      companyId: user.companyId.toString(),
      type: "accessToken",
    });

    const response = await request(app.getHttpServer())
      .put(`/projects/${project.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Updated Project Name",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        name: "Updated Project Name",
      }),
    );

    const projectOnDatabase = await prisma.project.findUnique({
      where: {
        id: project.id.toString(),
      },
    });

    expect(projectOnDatabase?.name).toBe("Updated Project Name");
  });
});
