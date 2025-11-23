import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeGroupItem } from "test/factories/eletrical-distribution-budgeting/make-group-item";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { InMemoryGroupItemsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-group-items-repository";
import { InMemoryGroupsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-groups-repository";
import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { EditGroupUseCase } from "./edit-group";

let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let inMemoryGroupItemsRepository: InMemoryGroupItemsRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let sut: EditGroupUseCase;

describe("Edit Group", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
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
    );
  });

  it("should be able to edit a group", async () => {
    // Create initial group with items
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

    await inMemoryGroupItemsRepository.createMany([groupItem1, groupItem2]);

    // Create materials for validation
    await inMemoryMaterialsRepository.createMany([
      makeMaterial({}, new UniqueEntityID("material-1")),
      makeMaterial({}, new UniqueEntityID("new-material")),
    ]);

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
          groupItemId: groupItem1.id.toString(),
        },
        {
          type: "cableConnector",
          quantity: 3,
          localCableSectionInMM: 15,
          description: "new cable connector",
        },
      ],
    });
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryGroupsRepository.items[0].name).toBe("UPDATED GROUP");
      expect(inMemoryGroupsRepository.items[0].description).toBe(
        "updated description",
      );
      expect(inMemoryGroupsRepository.items[0].tension.value).toBe("LOW");

      // Check items were updated correctly
      const updatedItems = inMemoryGroupItemsRepository.items.filter(
        (item) => item.groupId.toString() === group.id.toString(),
      );

      expect(updatedItems).toHaveLength(3); // One existing updated + one new added
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
            lengthAdd: 10,
          }),
        }),
      );
      expect(updatedItems[2]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            type: "cableConnector",
            localCableSectionInMM: 15,
            quantity: 3,
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

  it("should not be able to edit a group with negative values for context items", async () => {
    const group = makeGroup();
    await inMemoryGroupsRepository.createMany([group]);

    const result1 = await sut.execute({
      groupToEditId: group.id.toString(),
      items: [
        {
          type: "poleScrew",
          quantity: 5,
          lengthAdd: -10,
        },
      ],
    });

    expect(result1.isLeft()).toBeTruthy();
    if (result1.isLeft()) {
      expect(result1.value).toBeInstanceOf(NotAllowedError);
      expect(result1.value.message).toBe(
        'Item of type "poleScrew" must have a positive value for "lengthAdd".',
      );
    }

    const result2 = await sut.execute({
      groupToEditId: group.id.toString(),
      items: [
        {
          type: "cableConnector",
          quantity: 3,
          localCableSectionInMM: -5,
        },
      ],
    });

    expect(result2.isLeft()).toBeTruthy();
    if (result2.isLeft()) {
      expect(result2.value).toBeInstanceOf(NotAllowedError);
      expect(result2.value.message).toBe(
        'Item of type "cableConnector" must have a positive value for "localCableSectionInMM".',
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
      expect(result.value).toBeInstanceOf(NotAllowedError);
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
