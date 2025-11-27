import { INestApplication, ValidationPipe } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { GroupsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/groups-repository";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeGroupItem } from "test/factories/eletrical-distribution-budgeting/make-group-item";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";

describe("Fetch Groups (E2E)", () => {
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
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    jwt = moduleRef.get(JwtService);
    groupsRepository = moduleRef.get(GroupsRepository);
    materialsRepository = moduleRef.get(MaterialsRepository);

    await app.init();
  });

  test("[GET] /groups", async () => {
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

    const group1 = makeGroup({
      name: "Group 1",
      tension: TensionLevel.create("MEDIUM"),
    });
    const groupItem1 = makeGroupItem({
      groupId: group1.id,
      type: "material",
      materialId: material.id,
      quantity: 1,
    });
    await groupsRepository.createGroupWithItems(group1, [groupItem1]);

    const group2 = makeGroup({
      name: "Group 2",
      tension: TensionLevel.create("LOW"),
    });
    const groupItem2 = makeGroupItem({
      groupId: group2.id,
      type: "material",
      materialId: material.id,
      quantity: 2,
    });
    await groupsRepository.createGroupWithItems(group2, [groupItem2]);

    const response = await request(app.getHttpServer())
      .get("/groups")
      .set("Authorization", `Bearer ${accessToken}`)
      .query({
        page: 1,
        pageSize: 10,
        name: "Group 1",
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.groups).toHaveLength(1);
    expect(response.body.groups[0].group).toEqual(
      expect.objectContaining({
        id: group1.id.toString(),
        name: "Group 1",
      }),
    );
    expect(response.body.groups[0].items).toHaveLength(1);
    expect(response.body.groups[0].items[0]).toEqual(
      expect.objectContaining({
        groupItemId: groupItem1.id.toString(),
        quantity: 1,
      }),
    );
  });
});
