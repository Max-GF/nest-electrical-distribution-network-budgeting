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

describe("Create Bulk Of Groups (E2E)", () => {
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

  test("[POST] /groups/bulk", async () => {
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

    const material1 = makeMaterial();
    const material2 = makeMaterial();
    await materialsRepository.createMany([material1, material2]);

    const response = await request(app.getHttpServer())
      .post("/groups/bulk")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        groups: [
          {
            name: "Group 1",
            description: "Group 1 Description",
            tension: "MEDIUM",
            items: [
              {
                type: "material",
                quantity: 1,
                addByPhase: 0,
                description: "Item 1 Description",
                materialId: material1.id.toString(),
              },
            ],
          },
          {
            name: "Group 2",
            description: "Group 2 Description",
            tension: "LOW",
            items: [
              {
                type: "material",
                quantity: 2,
                addByPhase: 1,
                description: "Item 2 Description",
                materialId: material2.id.toString(),
              },
            ],
          },
        ],
      });

    expect(response.statusCode).toBe(201);
    expect(response.body.groups).toHaveLength(2);
    expect(response.body.groups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "GROUP 1",
          description: "group 1 description",
          tension: "MEDIUM",
        }),
        expect.objectContaining({
          name: "GROUP 2",
          description: "group 2 description",
          tension: "LOW",
        }),
      ]),
    );

    const group1OnDatabase = await groupsRepository.findByName("GROUP 1");
    expect(group1OnDatabase).toBeTruthy();
    const group2OnDatabase = await groupsRepository.findByName("GROUP 2");
    expect(group2OnDatabase).toBeTruthy();
  });
});
