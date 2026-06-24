import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeGroupItem } from "test/factories/eletrical-distribution-budgeting/make-group-item";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { InMemoryGroupItemsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-group-items-repository";
import { InMemoryGroupsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-groups-repository";
import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { EditGroupUseCase } from "./edit-group";

let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let inMemoryCablesRepository: InMemoryCablesRepository;
let inMemoryGroupItemsRepository: InMemoryGroupItemsRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let sut: EditGroupUseCase;

describe("Edit Group", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    inMemoryCablesRepository = new InMemoryCablesRepository();
    inMemoryGroupItemsRepository = new InMemoryGroupItemsRepository(
      inMemoryMaterialsRepository,
    );
    inMemoryGroupsRepository = new InMemoryGroupsRepository(
      inMemoryGroupItemsRepository,
    );
    sut = new EditGroupUseCase(
      inMemoryGroupsRepository,
      inMemoryGroupItemsRepository,
      inMemoryMaterialsRepository,
      inMemoryCablesRepository,
    );
  });

  it("should be able to edit a group", async () => {
    // Setup: Grupo inicial e itens
    const group = makeGroup({
      name: "OLD GROUP",
      description: "old description",
      tension: TensionLevel.create("MEDIUM"),
    });
    await inMemoryGroupsRepository.createMany([group]);

    const groupItem1 = makeGroupItem({
      groupId: group.id,
      type: "material",
      materialId: new UniqueEntityID("material-1"),
    });
    const groupItem2 = makeGroupItem({
      groupId: group.id,
      type: "poleScrew",
      lengthAdd: 10,
    });
    const groupItem3 = makeGroupItem({
      groupId: group.id,
      type: "cableConnector",
      localCableId: new UniqueEntityID("old-cable-id"),
      addByPhase: 3,
      oneSideConnector: false,
    });

    await inMemoryGroupItemsRepository.createMany([
      groupItem1,
      groupItem2,
      groupItem3,
    ]);

    // Setup: Criação de Materiais e Cabos para validação
    await inMemoryMaterialsRepository.createMany([
      makeMaterial({}, new UniqueEntityID("material-1")),
      makeMaterial({}, new UniqueEntityID("new-material")),
    ]);

    await inMemoryCablesRepository.createMany([
      makeCable({}, new UniqueEntityID("new-cable-id")),
    ]);

    // Ação
    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      name: "UPDATED GROUP",
      description: "updated description",
      tension: "low",
      items: [
        {
          type: "material",
          materialId: "new-material",
          quantity: 5,
          groupItemId: groupItem1.id.toString(), // Editando o item 1
        },
        {
          type: "cableConnector",
          quantity: 3,
          description: "new cable connector as strap",
          oneSideConnector: true, // Adicionando um novo
        },
        {
          groupItemId: groupItem3.id.toString(), // Editando o item 3
          type: "cableConnector",
          quantity: 3,
          localCableId: "new-cable-id", // Trocando o cabo
          description: "Edited cable connector with new cable",
          oneSideConnector: false,
        },
      ],
    });

    // Asserts
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryGroupsRepository.items[0].name).toBe("UPDATED GROUP");
      expect(inMemoryGroupsRepository.items[0].description).toBe(
        "updated description",
      );
      expect(inMemoryGroupsRepository.items[0].tension.value).toBe("LOW");

      const updatedItems = inMemoryGroupItemsRepository.items.filter(
        (item) => item.groupId.toString() === group.id.toString(),
      );

      expect(updatedItems).toHaveLength(4); // 3 editados/mantidos + 1 novo

      expect(updatedItems[0]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            type: "material",
            materialId: expect.objectContaining({ value: "new-material" }),
            quantity: 5,
          }),
        }),
      );

      expect(updatedItems[1]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            type: "poleScrew",
            lengthAdd: 10, // Intacto
          }),
        }),
      );

      expect(updatedItems[2]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            type: "cableConnector",
            localCableId: expect.objectContaining({ value: "new-cable-id" }), // Cabo trocado
            quantity: 3,
            description: "Edited cable connector with new cable",
            oneSideConnector: false,
          }),
        }),
      );

      expect(updatedItems[3]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            type: "cableConnector",
            quantity: 3,
            description: "new cable connector as strap",
            oneSideConnector: true,
          }),
        }),
      );
    }
  });

  it("should not be able to edit a non-existent group", async () => {
    const result = await sut.execute({
      groupToEditId: "non-existent-id",
      name: "UPDATED GROUP",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe(
        'Group with ID "non-existent-id" was not found.',
      );
    }
  });

  it("should not be able to edit a group with an already registered name", async () => {
    const group1 = makeGroup({ name: "EXISTING GROUP" });
    const group2 = makeGroup({ name: "ANOTHER GROUP" });
    await inMemoryGroupsRepository.createMany([group1, group2]);

    const result = await sut.execute({
      groupToEditId: group2.id.toString(),
      name: "EXISTING GROUP",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe(
        'Group name "EXISTING GROUP" is already registered.',
      );
    }
  });

  it("should not be able to edit a group with invalid tension", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      tension: "invalid-tension",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        'Tension level "invalid-tension" is not allowed.',
      );
    }
  });

  it("should not be able to edit a group with negative values for context items (pole screw)", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      items: [
        {
          type: "poleScrew",
          quantity: 5,
          lengthAdd: -10,
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        'Item of type "poleScrew" must have a positive value for "lengthAdd".',
      );
    }
  });
  it("should not be able to edit a group with non-existent local cable", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      items: [
        {
          type: "cableConnector",
          localCableId: "non-existent-cable",
          quantity: 5,
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe(
        "Local Cables with missing IDs: non-existent-cable",
      );
    }
  });

  it("should not be able to edit a group with non-existent materials", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      items: [
        {
          type: "material",
          materialId: "non-existent-material",
          quantity: 5,
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe(
        "Materials with missing IDs: non-existent-material",
      );
    }
  });

  it("should not be able to edit a group without providing any changes", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    const result = await sut.execute({
      groupToEditId: group.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "At least one field must be provided to edit the group.",
      );
    }
  });

  it("should not be able to edit a group providing same values", async () => {
    const group = makeGroup({
      name: "TEST GROUP",
      description: "test description",
    });
    await inMemoryGroupsRepository.createMany([group]);

    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      name: "TEST GROUP",
      description: "test description",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "At least one different value must be provided to edit the group.",
      );
    }
  });

  it("should not be able to edit items that do not belong to the group", async () => {
    const group1 = makeGroup();
    const group2 = makeGroup();
    await inMemoryGroupsRepository.createMany([group1, group2]);

    const group2Item = makeGroupItem({
      groupId: group2.id,
      type: "material",
    });
    await inMemoryGroupItemsRepository.createMany([group2Item]);

    await inMemoryMaterialsRepository.createMany([
      makeMaterial({}, new UniqueEntityID("some-material")),
    ]);

    const result = await sut.execute({
      groupToEditId: group1.id.toString(),
      items: [
        {
          type: "material",
          materialId: "some-material",
          quantity: 5,
          groupItemId: group2Item.id.toString(), // Item from different group
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain(
        "do not belong to the given group and cannot be edited",
      );
    }
  });

  it("should be able to remove items from a group", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    const groupItem1 = makeGroupItem({
      groupId: group.id,
      type: "material",
      materialId: new UniqueEntityID("material-1"),
    });
    const groupItem2 = makeGroupItem({
      groupId: group.id,
      type: "poleScrew",
      lengthAdd: 10,
    });
    await inMemoryGroupItemsRepository.createMany([groupItem1, groupItem2]);

    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      itemsToRemoveIds: [groupItem1.id.toString()],
    });

    expect(result.isRight()).toBeTruthy();
    const remainingItems = inMemoryGroupItemsRepository.items.filter(
      (item) => item.groupId.toString() === group.id.toString(),
    );
    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].id.toString()).toBe(groupItem2.id.toString());
  });

  it("should be able to remove and edit items at the same time", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    await inMemoryMaterialsRepository.createMany([
      makeMaterial({}, new UniqueEntityID("material-1")),
      makeMaterial({}, new UniqueEntityID("material-2")),
    ]);

    const groupItem1 = makeGroupItem({
      groupId: group.id,
      type: "material",
      materialId: new UniqueEntityID("material-1"),
    });
    const groupItem2 = makeGroupItem({
      groupId: group.id,
      type: "poleScrew",
      lengthAdd: 10,
    });
    await inMemoryGroupItemsRepository.createMany([groupItem1, groupItem2]);

    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      itemsToRemoveIds: [groupItem2.id.toString()],
      items: [
        {
          type: "material",
          materialId: "material-2",
          quantity: 3,
          groupItemId: groupItem1.id.toString(),
        },
      ],
    });

    expect(result.isRight()).toBeTruthy();
    const remainingItems = inMemoryGroupItemsRepository.items.filter(
      (item) => item.groupId.toString() === group.id.toString(),
    );
    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].id.toString()).toBe(groupItem1.id.toString());
    expect(remainingItems[0].materialId?.toString()).toBe("material-2");
    expect(remainingItems[0].quantity).toBe(3);
  });

  it("should ignore id in remove list when it is also in edit list", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    await inMemoryMaterialsRepository.createMany([
      makeMaterial({}, new UniqueEntityID("material-1")),
      makeMaterial({}, new UniqueEntityID("material-2")),
    ]);

    const groupItem1 = makeGroupItem({
      groupId: group.id,
      type: "material",
      materialId: new UniqueEntityID("material-1"),
      quantity: 1,
    });
    await inMemoryGroupItemsRepository.createMany([groupItem1]);

    // Send same ID in both remove and edit — edit must win
    const result = await sut.execute({
      groupToEditId: group.id.toString(),
      itemsToRemoveIds: [groupItem1.id.toString()],
      items: [
        {
          type: "material",
          materialId: "material-2",
          quantity: 9,
          groupItemId: groupItem1.id.toString(),
        },
      ],
    });

    expect(result.isRight()).toBeTruthy();
    const remainingItems = inMemoryGroupItemsRepository.items.filter(
      (item) => item.groupId.toString() === group.id.toString(),
    );
    // Item must still exist (not removed) and be updated
    expect(remainingItems).toHaveLength(1);
    expect(remainingItems[0].materialId?.toString()).toBe("material-2");
    expect(remainingItems[0].quantity).toBe(9);
  });

  it("should not be able to remove items that do not belong to the group or are non-existent", async () => {
    const group1 = makeGroup();
    const group2 = makeGroup();
    await inMemoryGroupsRepository.createMany([group1, group2]);

    const group2Item = makeGroupItem({
      groupId: group2.id,
      type: "poleScrew",
      lengthAdd: 5,
    });
    await inMemoryGroupItemsRepository.createMany([group2Item]);

    // Try to remove an item from group2 while editing group1
    const result1 = await sut.execute({
      groupToEditId: group1.id.toString(),
      itemsToRemoveIds: [group2Item.id.toString()],
    });

    expect(result1.isLeft()).toBeTruthy();
    if (result1.isLeft()) {
      expect(result1.value).toBeInstanceOf(NotAllowedError);
      expect(result1.value.message).toContain(
        "do not belong to the given group and cannot be removed",
      );
    }

    // Try to remove a completely non-existent ID
    const result2 = await sut.execute({
      groupToEditId: group1.id.toString(),
      itemsToRemoveIds: ["non-existent-item-id"],
    });

    expect(result2.isLeft()).toBeTruthy();
    if (result2.isLeft()) {
      expect(result2.value).toBeInstanceOf(NotAllowedError);
      expect(result2.value.message).toContain(
        "do not belong to the given group and cannot be removed",
      );
    }
  });

  it("should be able to handle partial edits", async () => {
    const group = makeGroup({
      name: "ORIGINAL NAME",
      description: "original description",
    });
    await inMemoryGroupsRepository.createMany([group]);

    // Test editing only name
    const result1 = await sut.execute({
      groupToEditId: group.id.toString(),
      name: "UPDATED NAME ONLY",
    });

    expect(result1.isRight()).toBeTruthy();
    if (result1.isRight()) {
      expect(inMemoryGroupsRepository.items[0].name).toBe("UPDATED NAME ONLY");
      expect(inMemoryGroupsRepository.items[0].description).toBe(
        "original description",
      );
    }

    // Test editing only description
    const result2 = await sut.execute({
      groupToEditId: group.id.toString(),
      description: "updated description only",
    });

    expect(result2.isRight()).toBeTruthy();
    if (result2.isRight()) {
      expect(inMemoryGroupsRepository.items[0].description).toBe(
        "updated description only",
      );
    }
  });
});
