import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";
import request from "supertest";

describe("Create Bulk Of Materials (E2E)", () => {
  let app: INestApplication;
  let jwt: JwtService;
  let materialsRepository: MaterialsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [],
    }).compile();

    app = moduleRef.createNestApplication();
    jwt = moduleRef.get(JwtService);
    materialsRepository = moduleRef.get(MaterialsRepository);

    await app.init();
  });

  test("[POST] /materials/bulk", async () => {
    const user = await makeUser();
    const company = await makeCompany();
    const base = await makeBase({ companyId: company.id });
    const accessToken = jwt.sign({
      sub: user.id.toString(),
      companyId: company.id.toString(),
      baseId: base.id.toString(),
      role: "ADMIN",
      type: "accessToken",
    });

    const response = await request(app.getHttpServer())
      .post("/materials/bulk")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        materials: [
          {
            code: 12345,
            description: "Material 1",
            unit: "UN",
            tension: "MEDIUM",
          },
          {
            code: 67890,
            description: "Material 2",
            unit: "M",
            tension: "LOW",
          },
        ],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.created).toHaveLength(2);
    expect(response.body.failed).toHaveLength(0);

    const material1 = await materialsRepository.findByCode(12345);
    const material2 = await materialsRepository.findByCode(67890);

    expect(material1).toBeTruthy();
    expect(material2).toBeTruthy();
  });
});
