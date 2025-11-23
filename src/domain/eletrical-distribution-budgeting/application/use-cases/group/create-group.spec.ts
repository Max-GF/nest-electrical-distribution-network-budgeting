import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { InMemoryGroupItemsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-group-items-repository";
import { InMemoryGroupsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-groups-repository";
import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { CreateGroupUseCase } from "./create-group";

let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let inMemoryGroupItemsRepository: InMemoryGroupItemsRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let sut: CreateGroupUseCase;

describe("Create Group", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    inMemoryGroupItemsRepository = new InMemoryGroupItemsRepository(
      inMemoryMaterialsRepository,
    );
    inMemoryGroupsRepository = new InMemoryGroupsRepository(
      inMemoryGroupItemsRepository,
    );
    sut = new CreateGroupUseCase(
      inMemoryGroupsRepository,
      inMemoryMaterialsRepository,
    );
  });

  it("should be able to create a group", async () => {
    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("some-test-material-id"),
      ),
      makeMaterial(
        {
          code: 10001,
          description: "SOME TEST MATERIAL 2",
        },
        new UniqueEntityID("some-test-material-id-2"),
      ),
    ]);

    expect(inMemoryGroupsRepository.items).toHaveLength(0);
    const result = await sut.execute({
      name: "Some Group",
      description: "Some Group Description",
      tension: "low",
      items: [
        {
          type: "material",
          materialId: "some-test-material-id",
          quantity: 10,
          description: "Material destinated to testing",
        },
        {
          type: "material",
          materialId: "some-test-material-id-2",
          quantity: 5,
          description: "Material destinated to testing 2",
        },
        {
          type: "poleScrew",
          quantity: 5,
          lengthAdd: 15,
          description: "Material destinated to testing 3",
        },
        {
          type: "cableConnector",
          quantity: 5,
          localCableSectionInMM: 10,
          addByPhase: 3,
          description: "Material destinated to testing 4",
        },
      ],
    });

    expect(inMemoryGroupsRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryGroupsRepository.items[0]).toEqual(result.value.group);
      expect(inMemoryGroupItemsRepository.items).toHaveLength(4);
      inMemoryGroupItemsRepository.items.forEach((item) => {
        expect(item).toBeInstanceOf(GroupItem);
      });
      expect(inMemoryGroupItemsRepository.items[0]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            type: "material",
            materialId: expect.objectContaining({
              value: "some-test-material-id",
            }),
          }),
        }),
      );
      expect(inMemoryGroupItemsRepository.items[1]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            type: "material",
            materialId: expect.objectContaining({
              value: "some-test-material-id-2",
            }),
          }),
        }),
      );
      expect(inMemoryGroupItemsRepository.items[2]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({ type: "poleScrew", lengthAdd: 15 }),
        }),
      );
      expect(inMemoryGroupItemsRepository.items[3]).toEqual(
        expect.objectContaining({
          props: expect.objectContaining({
            type: "cableConnector",
            localCableSectionInMM: 10,
            addByPhase: 3,
          }),
        }),
      );
    }
  });
  it("should not be able to create a group with negative value for context item", async () => {
    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("some-test-material-id"),
      ),
      makeMaterial(
        {
          code: 10001,
          description: "SOME TEST MATERIAL 2",
        },
        new UniqueEntityID("some-test-material-id-2"),
      ),
    ]);

    expect(inMemoryGroupsRepository.items).toHaveLength(0);
    const result1 = await sut.execute({
      name: "Some Group",
      description: "Some Group Description",
      tension: "low",
      items: [
        {
          type: "material",
          materialId: "some-test-material-id",
          quantity: 10,
          description: "Material destinated to testing",
        },
        {
          type: "material",
          materialId: "some-test-material-id-2",
          quantity: 5,
          description: "Material destinated to testing 2",
        },
        {
          type: "poleScrew",
          quantity: 5,
          lengthAdd: 15,
          description: "Material destinated to testing 3",
        },
        {
          type: "cableConnector",
          quantity: 5,
          localCableSectionInMM: -10,
          addByPhase: 3,
          description: "Material destinated to testing 4",
        },
      ],
    });

    expect(inMemoryGroupsRepository.items).toHaveLength(0);
    expect(result1.isLeft()).toBeTruthy();
    if (result1.isLeft()) {
      expect(result1.value).toBeInstanceOf(NotAllowedError);
      expect(result1.value.message).toBe(
        'Item of type "cableConnector" must have a positive value for "localCableSectionInMM".',
      );
    }
    const result2 = await sut.execute({
      name: "Some Group",
      description: "Some Group Description",
      tension: "low",
      items: [
        {
          type: "material",
          materialId: "some-test-material-id",
          quantity: 10,
          description: "Material destinated to testing",
        },
        {
          type: "material",
          materialId: "some-test-material-id-2",
          quantity: 5,
          description: "Material destinated to testing 2",
        },
        {
          type: "poleScrew",
          quantity: 5,
          lengthAdd: -15,
          description: "Material destinated to testing 3",
        },
        {
          type: "cableConnector",
          quantity: 5,
          localCableSectionInMM: 10,
          addByPhase: 3,
          description: "Material destinated to testing 4",
        },
      ],
    });

    expect(inMemoryGroupsRepository.items).toHaveLength(0);
    expect(result2.isLeft()).toBeTruthy();
    if (result2.isLeft()) {
      expect(result2.value).toBeInstanceOf(NotAllowedError);
      expect(result2.value.message).toBe(
        'Item of type "poleScrew" must have a positive value for "lengthAdd".',
      );
    }
  });

  it("should not be able to create more than one group with the same name", async () => {
    const alreadyRegisteredGroup = makeGroup({
      name: "Some Group",
    });
    await inMemoryGroupsRepository.createMany([alreadyRegisteredGroup]);
    expect(inMemoryGroupsRepository.items).toHaveLength(1);
    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("some-test-material-id"),
      ),
      makeMaterial(
        {
          code: 10001,
          description: "SOME TEST MATERIAL 2",
        },
        new UniqueEntityID("some-test-material-id-2"),
      ),
    ]);

    const result = await sut.execute({
      name: "Some Group",
      description: "Some Group Description",
      tension: "low",
      items: [
        {
          type: "material",
          materialId: "some-test-material-id",
          quantity: 10,
          description: "Material destinated to testing",
        },
        {
          type: "material",
          materialId: "some-test-material-id-2",
          quantity: 5,
          description: "Material destinated to testing 2",
        },
      ],
    });

    expect(inMemoryGroupsRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe(
        'Group name "Some Group" is already registered.',
      );
    }
  });

  it("should not be able to create a group with no items", async () => {
    const result = await sut.execute({
      name: "Some Group",
      description: "Some Group 2",
      tension: "low",
      items: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Group must have at least one item.");
    }
  });

  it("should not be able to create a group with invalid tension", async () => {
    const result = await sut.execute({
      name: "Some Group",
      description: "Some Group 2",
      tension: "invalid",
      items: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        'Tension level "invalid" is not allowed.',
      );
    }
  });

  it("should not be able to create a group with invalid materialId", async () => {
    const result = await sut.execute({
      name: "Some Group",
      description: "Some Group Description",
      tension: "low",
      items: [
        {
          type: "material",
          materialId: "some-test-material-id",
          quantity: 10,
          description: "Material destinated to testing",
        },
        {
          type: "material",
          materialId: "some-test-material-id-2",
          quantity: 5,
          description: "Material destinated to testing 2",
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Materials with missing IDs: some-test-material-id, some-test-material-id-2",
      );
    }
  });
});
