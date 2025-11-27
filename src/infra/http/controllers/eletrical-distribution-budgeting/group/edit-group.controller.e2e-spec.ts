import { INestApplication } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test } from "@nestjs/testing";
import { GroupsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/groups-repository";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeGroupItem } from "test/factories/eletrical-distribution-budgeting/make-group-item";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";

describe("Edit Group (E2E)", () => {
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

  test("[PUT] /groups/:id", async () => {
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

    const group = makeGroup();
    const groupItem = makeGroupItem({
      groupId: group.id,
      type: "material",
      materialId: material.id,
      quantity: 1,
    });
    await groupsRepository.createGroupWithItems(group, [groupItem]);

    const response = await request(app.getHttpServer())
      .put(`/groups/${group.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Updated Group Name",
        description: "Updated Description",
        tension: "LOW",
        items: [
          {
            groupItemId: groupItem.id.toString(),
            type: "material",
            quantity: 5,
            addByPhase: 0,
            description: "Updated Item Description",
            materialId: material.id.toString(),
          },
        ],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      group: expect.objectContaining({
        id: group.id.toString(),
        name: "UPDATED GROUP NAME",
        description: "updated description",
        tension: "LOW",
      }),
    });

    const groupOnDatabase = await groupsRepository.findById(
      group.id.toString(),
    );
    expect(groupOnDatabase).toBeTruthy();
    expect(groupOnDatabase?.name).toBe("UPDATED GROUP NAME");
    expect(groupOnDatabase?.tension.value).toBe("LOW");
  });
});
