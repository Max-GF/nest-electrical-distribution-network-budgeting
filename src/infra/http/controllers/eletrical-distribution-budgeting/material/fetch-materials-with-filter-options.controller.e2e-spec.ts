import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";

describe("Fetch Materials With Filter Options (E2E)", () => {
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

  test("[GET] /materials", async () => {
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

    await materialsRepository.createMany([
      makeMaterial({
        code: 12345,
        description: "Material 1",
      }),
    ]);

    await materialsRepository.createMany([
      makeMaterial({
        code: 67890,
        description: "Material 2",
      }),
    ]);

    const response = await request(app.getHttpServer())
      .get("/materials")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({
        page: 1,
        pageSize: 10,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.materials).toHaveLength(2);
    expect(response.body.pagination).toEqual({
      actualPage: 1,
      actualPageSize: 2,
      lastPage: 1,
    });
  });
});
