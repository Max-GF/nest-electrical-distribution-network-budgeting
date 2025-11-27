import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { GroupsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/groups-repository";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";

describe("Create Group (E2E)", () => {
  let app: INestApplication;
  let jwt: JwtService;
  let groupsRepository: GroupsRepository;
  let materialsRepository: MaterialsRepository;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [],
    }).compile();

    app = moduleRef.createNestApplication();
    jwt = moduleRef.get(JwtService);
    groupsRepository = moduleRef.get(GroupsRepository);
    materialsRepository = moduleRef.get(MaterialsRepository);

    await app.init();
  });

  test("[POST] /groups", async () => {
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
      .post("/groups")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Group 1",
        description: "Group Description",
        tension: "MEDIUM",
        items: [
          {
            type: "material",
            quantity: 1,
            addByPhase: 0,
            description: "Item Description",
            materialId: material.id.toString(),
          },
        ],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({
      group: expect.objectContaining({
        name: "GROUP 1",
        description: "group description",
        tension: "MEDIUM",
      }),
    });

    const groupOnDatabase = await groupsRepository.findByName("GROUP 1");
    expect(groupOnDatabase).toBeTruthy();
  });
});
