import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import request from "supertest";

describe("Edit Material (E2E)", () => {
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

  test("[PUT] /materials/:id", async () => {
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

    const material = makeMaterial();
    await materialsRepository.createMany([material]);

    const response = await request(app.getHttpServer())
      .put(`/materials/${material.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        description: "New Description",
      });

    expect(response.body).toEqual({
      material: expect.objectContaining({
        id: material.id.toString(),
        description: "NEW DESCRIPTION",
      }),
    });

    const materialOnDatabase = await materialsRepository.findById(
      material.id.toString(),
    );
    expect(materialOnDatabase?.description).toBe("NEW DESCRIPTION");
  });
});
