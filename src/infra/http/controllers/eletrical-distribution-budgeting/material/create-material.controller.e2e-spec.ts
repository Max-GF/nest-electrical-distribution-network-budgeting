import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";

describe("Create Material (E2E)", () => {
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

  test("[POST] /materials", async () => {
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
      .post("/materials")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        code: 12345,
        description: "Material Description",
        unit: "UN",
        tension: "MEDIUM",
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      material: expect.objectContaining({
        code: 12345,
        description: "MATERIAL DESCRIPTION",
        unit: "UN",
        tension: "MEDIUM",
      }),
    });

    const materialOnDatabase = await materialsRepository.findByCode(12345);
    expect(materialOnDatabase).toBeTruthy();
  });
});
