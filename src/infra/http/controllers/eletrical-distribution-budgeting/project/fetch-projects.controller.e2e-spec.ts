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

describe("Fetch Projects (E2E)", () => {
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

  test("[GET] /projects", async () => {
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

    const project1 = makeProject({ name: "Project 01" });
    const project2 = makeProject({ name: "Project 02" });

    await prisma.project.createMany({
      data: [
        {
          id: project1.id.toString(),
          name: project1.name,
          description: project1.description,
          budgetAlreadyCalculated: project1.budgetAlreadyCalculated,
          lastBudgetCalculatedAt: project1.lastBudgetCalculatedAt,
        },
        {
          id: project2.id.toString(),
          name: project2.name,
          description: project2.description,
          budgetAlreadyCalculated: project2.budgetAlreadyCalculated,
          lastBudgetCalculatedAt: project2.lastBudgetCalculatedAt,
        },
      ],
    });

    const accessToken = jwt.sign({
      sub: user.id.toString(),
      role: user.role.value,
      baseId: user.baseId.toString(),
      companyId: user.companyId.toString(),
      type: "accessToken",
    });

    const response = await request(app.getHttpServer())
      .get("/projects")
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(2);
    expect(response.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Project 01" }),
        expect.objectContaining({ name: "Project 02" }),
      ]),
    );
  });
});
