import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { InMemoryGroupItemsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-group-items-repository";
import { InMemoryGroupsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-groups-repository";
import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { CreateBulkOfGroupUseCase } from "./create-bulk-of-groups";

let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let inMemoryGroupItemsRepository: InMemoryGroupItemsRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let sut: CreateBulkOfGroupUseCase;

describe("Create Bulk Of Group", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    inMemoryGroupItemsRepository = new InMemoryGroupItemsRepository(
      inMemoryMaterialsRepository,
    );
    inMemoryGroupsRepository = new InMemoryGroupsRepository(
      inMemoryGroupItemsRepository,
    );
    sut = new CreateBulkOfGroupUseCase(
      inMemoryGroupsRepository,
      inMemoryMaterialsRepository,
    );
  });

  it("should be able to create multiple groups", async () => {
    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("material-1"),
      ),
      makeMaterial(
        {
          code: 10001,
          description: "SOME TEST MATERIAL 2",
        },
        new UniqueEntityID("material-2"),
      ),
      makeMaterial(
        {
          code: 10002,
          description: "SOME TEST MATERIAL 3",
        },
        new UniqueEntityID("material-3"),
      ),
    ]);

    expect(inMemoryGroupsRepository.items).toHaveLength(0);

    const result = await sut.execute({
      groups: [
        {
          name: "Group 1",
          description: "First group description",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 10,
              description: "Material for group 1",
            },
            {
              type: "poleScrew",
              quantity: 5,
              lengthAdd: 15,
              description: "Pole screw for group 1",
            },
          ],
        },
        {
          name: "Group 2",
          description: "Second group description",
          tension: "medium",
          items: [
            {
              type: "material",
              materialId: "material-2",
              quantity: 8,
              description: "Material for group 2",
            },
            {
              type: "cableConnector",
              quantity: 3,
              localCableSectionInMM: 10,
              addByPhase: 2,
              description: "Cable connector for group 2",
            },
          ],
        },
        {
          name: "Group 3",
          description: "Third group description",
          tension: "medium",
          items: [
            {
              type: "material",
              materialId: "material-3",
              quantity: 12,
              description: "Material for group 3",
            },
          ],
        },
      ],
    });
    expect(inMemoryGroupsRepository.items).toHaveLength(3);
    expect(result.isRight()).toBeTruthy();

    if (result.isRight()) {
      expect(result.value.groups).toHaveLength(3);
      expect(inMemoryGroupItemsRepository.items).toHaveLength(5);

      // Verificar se os grupos foram criados com os nomes corretos
      const groupNames = inMemoryGroupsRepository.items.map(
        (group) => group.name,
      );
      expect(groupNames).toContain("GROUP 1");
      expect(groupNames).toContain("GROUP 2");
      expect(groupNames).toContain("GROUP 3");

      // Verificar se os GroupItems foram criados corretamente
      inMemoryGroupItemsRepository.items.forEach((item) => {
        expect(item).toBeInstanceOf(GroupItem);
      });
    }
  });

  it("should not be able to create groups with duplicate names in the same request", async () => {
    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("material-1"),
      ),
    ]);

    const result = await sut.execute({
      groups: [
        {
          name: "Duplicate Group",
          description: "First group",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 10,
            },
          ],
        },
        {
          name: "Duplicate Group", // Nome duplicado
          description: "Second group",
          tension: "medium",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 5,
            },
          ],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe(
        'Group name "Duplicate Group" is duplicated in the request.',
      );
    }
    expect(inMemoryGroupsRepository.items).toHaveLength(0);
  });

  it("should not be able to create groups with names already registered in database", async () => {
    const existingGroup = makeGroup({
      name: "EXISTING GROUP",
    });
    await inMemoryGroupsRepository.createMany([existingGroup]);

    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("material-1"),
      ),
    ]);

    const result = await sut.execute({
      groups: [
        {
          name: "Existing Group", // Já existe no banco (case insensitive)
          description: "Group description",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 10,
            },
          ],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe(
        'Group name "Existing Group" is already registered.',
      );
    }
    expect(inMemoryGroupsRepository.items).toHaveLength(1); // Apenas o grupo existente
  });

  it("should not be able to create groups with invalid tension", async () => {
    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("material-1"),
      ),
    ]);

    const result = await sut.execute({
      groups: [
        {
          name: "Valid Group",
          description: "Valid group",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 10,
            },
          ],
        },
        {
          name: "Invalid Group",
          description: "Invalid tension group",
          tension: "invalid-tension",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 5,
            },
          ],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        'Tension level "invalid-tension" is not allowed.',
      );
    }
    expect(inMemoryGroupsRepository.items).toHaveLength(0);
  });

  it("should not be able to create a group with no items", async () => {
    const result = await sut.execute({
      groups: [
        {
          name: "Group With Items",
          description: "Valid group",
          tension: "low",
          items: [
            {
              type: "poleScrew",
              quantity: 5,
              lengthAdd: 10,
            },
          ],
        },
        {
          name: "Group Without Items",
          description: "Invalid group",
          tension: "medium",
          items: [], // Array vazio
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        'Group "Group Without Items" must have at least one item.',
      );
    }
    expect(inMemoryGroupsRepository.items).toHaveLength(0);
  });

  it("should not be able to create groups with invalid material IDs", async () => {
    // Não criar materiais no repositório para simular IDs inválidos

    const result = await sut.execute({
      groups: [
        {
          name: "Group 1",
          description: "First group",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "non-existent-material-1",
              quantity: 10,
            },
            {
              type: "material",
              materialId: "non-existent-material-2",
              quantity: 5,
            },
          ],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain("Materials with missing IDs:");
      expect(result.value.message).toContain("non-existent-material-1");
      expect(result.value.message).toContain("non-existent-material-2");
    }
    expect(inMemoryGroupsRepository.items).toHaveLength(0);
  });

  it("should not be able to create groups with negative values for context items", async () => {
    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("material-1"),
      ),
    ]);

    const result1 = await sut.execute({
      groups: [
        {
          name: "Group 1",
          description: "Group with negative pole screw",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 10,
            },
            {
              type: "poleScrew",
              quantity: 5,
              lengthAdd: -15, // Valor negativo
            },
          ],
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
      groups: [
        {
          name: "Group 2",
          description: "Group with negative cable connector",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 10,
            },
            {
              type: "cableConnector",
              quantity: 5,
              localCableSectionInMM: -10, // Valor negativo
            },
          ],
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

    expect(inMemoryGroupsRepository.items).toHaveLength(0);
  });

  it("should not be able to create groups when empty array is provided", async () => {
    const result = await sut.execute({
      groups: [],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Must provide at least one group.");
    }
  });

  it("should handle mixed valid and invalid scenarios by failing the entire operation", async () => {
    // Criar apenas um material para que o segundo grupo falhe
    await inMemoryMaterialsRepository.createMany([
      makeMaterial(
        {
          code: 10000,
          description: "SOME TEST MATERIAL",
        },
        new UniqueEntityID("material-1"),
      ),
    ]);

    const existingGroup = makeGroup({
      name: "EXISTING GROUP",
    });
    await inMemoryGroupsRepository.createMany([existingGroup]);

    const result = await sut.execute({
      groups: [
        {
          name: "Valid Group",
          description: "Valid group",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 10,
            },
          ],
        },
        {
          name: "Existing Group", // Nome já existe
          description: "Duplicate group",
          tension: "medium",
          items: [
            {
              type: "material",
              materialId: "material-1",
              quantity: 5,
            },
          ],
        },
        {
          name: "Invalid Material Group",
          description: "Invalid material group",
          tension: "low",
          items: [
            {
              type: "material",
              materialId: "non-existent-material", // Material não existe
              quantity: 5,
            },
          ],
        },
      ],
    });

    // A operação inteira deve falar devido aos erros de validação
    expect(result.isLeft()).toBeTruthy();
    // Apenas o grupo existente original deve estar no repositório
    expect(inMemoryGroupsRepository.items).toHaveLength(1);
  });
});
