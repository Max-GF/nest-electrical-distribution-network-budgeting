import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { GroupItemsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/group-items-repository";
import { GroupsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/groups-repository";
import { MaterialsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/materials-repository";
import { UserRole } from "src/domain/user-management/enterprise/entities/value-objects/user-roles";
import { AppModule } from "src/infra/app.module";
import { DatabaseModule } from "src/infra/database/database.module";
import request from "supertest";
import { AccessTokenCreator } from "test/access-token-creator";
import { CableFactory } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeGroupItem } from "test/factories/eletrical-distribution-budgeting/make-group-item";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { BaseFactory } from "test/factories/user-management/make-base";
import { CompanyFactory } from "test/factories/user-management/make-company";
import { UserFactory } from "test/factories/user-management/make-user";

describe("Edit Group (E2E)", () => {
  let app: INestApplication;
  let groupsRepository: GroupsRepository;
  let groupItemsRepository: GroupItemsRepository;
  let materialsRepository: MaterialsRepository;
  let accessTokenCreator: AccessTokenCreator;
  let companyFactory: CompanyFactory;
  let baseFactory: BaseFactory;
  let userFactory: UserFactory;
  let cableFactory: CableFactory;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, DatabaseModule],
      providers: [
        AccessTokenCreator,
        CompanyFactory,
        BaseFactory,
        UserFactory,
        CableFactory,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    groupsRepository = moduleRef.get(GroupsRepository);
    groupItemsRepository = moduleRef.get(GroupItemsRepository);
    materialsRepository = moduleRef.get(MaterialsRepository);
    accessTokenCreator = moduleRef.get(AccessTokenCreator);
    companyFactory = moduleRef.get(CompanyFactory);
    baseFactory = moduleRef.get(BaseFactory);
    userFactory = moduleRef.get(UserFactory);
    cableFactory = moduleRef.get(CableFactory);

    await app.init();
  });

  async function getAccessToken() {
    const testCompany = await companyFactory.makePrismaCompany({});
    const testBase = await baseFactory.makePrismaBase({
      companyId: testCompany.id,
    });
    const user = await userFactory.makePrismaUser({
      role: UserRole.create("ADMIN"),
      isActive: true,
      firstLogin: false,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    return accessTokenCreator.execute(user);
  }

  test("[PUT] /groups/:id", async () => {
    const accessToken = await getAccessToken();

    const material = makeMaterial();
    await materialsRepository.createMany([material]);
    const cable = await cableFactory.makePrismaCable({});

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

          {
            type: "cableConnector",
            quantity: 2,
            addByPhase: 1,
            localCableId: cable.id.toString(),
            oneSideConnector: false,
          },
        ],
      });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      group: expect.objectContaining({
        id: group.id.toString(),
        name: "UPDATED GROUP NAME",
        description: "UPDATED DESCRIPTION",
        tension: "LOW",
      }),
    });

    const groupOnDatabase = await groupsRepository.findById(
      group.id.toString(),
    );
    expect(groupOnDatabase).toBeTruthy();
    expect(groupOnDatabase?.name).toBe("UPDATED GROUP NAME");
    expect(groupOnDatabase?.tension.value).toBe("LOW");

    const itemsOnDatabase = await groupItemsRepository.findByGroupId(
      group.id.toString(),
    );
    expect(itemsOnDatabase).toHaveLength(2);
  });

  test("[PUT] /groups/:id - should remove items from a group", async () => {
    const accessToken = await getAccessToken();
    const material = makeMaterial();
    await materialsRepository.createMany([material]);

    const group = makeGroup();
    const itemToKeep = makeGroupItem({
      groupId: group.id,
      type: "poleScrew",
      lengthAdd: 10,
      quantity: 1,
    });
    const itemToRemove = makeGroupItem({
      groupId: group.id,
      type: "material",
      materialId: material.id,
      quantity: 2,
    });
    await groupsRepository.createGroupWithItems(group, [
      itemToKeep,
      itemToRemove,
    ]);

    const response = await request(app.getHttpServer())
      .put(`/groups/${group.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        itemsToRemoveIds: [itemToRemove.id.toString()],
      });

    expect(response.statusCode).toBe(200);

    const remainingItems = await groupItemsRepository.findByGroupId(
      group.id.toString(),
    );
    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].id.toString()).toBe(itemToKeep.id.toString());
  });

  test("[PUT] /groups/:id - should remove and edit items atomically", async () => {
    const accessToken = await getAccessToken();

    const material1 = makeMaterial();
    const material2 = makeMaterial();
    await materialsRepository.createMany([material1, material2]);

    const group = makeGroup();
    const itemToEdit = makeGroupItem({
      groupId: group.id,
      type: "material",
      materialId: material1.id,
      quantity: 1,
    });
    const itemToRemove = makeGroupItem({
      groupId: group.id,
      type: "poleScrew",
      lengthAdd: 5,
      quantity: 1,
    });
    await groupsRepository.createGroupWithItems(group, [
      itemToEdit,
      itemToRemove,
    ]);

    const response = await request(app.getHttpServer())
      .put(`/groups/${group.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        itemsToRemoveIds: [itemToRemove.id.toString()],
        items: [
          {
            groupItemId: itemToEdit.id.toString(),
            type: "material",
            quantity: 9,
            materialId: material2.id.toString(),
          },
        ],
      });

    expect(response.statusCode).toBe(200);

    const remainingItems = await groupItemsRepository.findByGroupId(
      group.id.toString(),
    );
    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].id.toString()).toBe(itemToEdit.id.toString());
    expect(remainingItems[0].quantity).toBe(9);
    expect(remainingItems[0].materialId?.toString()).toBe(
      material2.id.toString(),
    );
  });

  test("[PUT] /groups/:id - should return 400 when removing item from another group", async () => {
    const accessToken = await getAccessToken();

    const group1 = makeGroup();
    const group2 = makeGroup();

    const group2Item = makeGroupItem({
      groupId: group2.id,
      type: "poleScrew",
      lengthAdd: 5,
      quantity: 1,
    });
    await groupsRepository.createGroupWithItems(group1, []);
    await groupsRepository.createGroupWithItems(group2, [group2Item]);

    const response = await request(app.getHttpServer())
      .put(`/groups/${group1.id.toString()}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        itemsToRemoveIds: [group2Item.id.toString()],
      });

    expect(response.statusCode).toBe(400);
  });
});
