import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { makePoint } from "test/factories/eletrical-distribution-budgeting/make-point";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { InMemoryGroupItemsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-group-items-repository";
import { InMemoryGroupsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-groups-repository";
import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { InMemoryPointsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-points-repository";
import { InMemoryProjectsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-projects-repository";
import { InMemoryUtilityPolesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-utility-poles-repository";
import { ValidateManyPointsUseCase } from "./validate-many-points";

let inMemoryPointsRepository: InMemoryPointsRepository;
let inMemoryProjectsRepository: InMemoryProjectsRepository;
let inMemoryUtilityPolesRepository: InMemoryUtilityPolesRepository;
let inMemoryCablesRepository: InMemoryCablesRepository;
let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let inMemoryGroupsRepository: InMemoryGroupsRepository;
let inMemoryGroupItemsRepository: InMemoryGroupItemsRepository;
let sut: ValidateManyPointsUseCase;

describe("Validate Many Points Use Case", () => {
  beforeEach(() => {
    inMemoryProjectsRepository = new InMemoryProjectsRepository();
    inMemoryUtilityPolesRepository = new InMemoryUtilityPolesRepository();
    inMemoryCablesRepository = new InMemoryCablesRepository();
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();

    inMemoryPointsRepository = new InMemoryPointsRepository(
      inMemoryCablesRepository,
      inMemoryProjectsRepository,
      inMemoryUtilityPolesRepository,
    );
    inMemoryGroupItemsRepository = new InMemoryGroupItemsRepository(
      inMemoryMaterialsRepository,
    );
    inMemoryGroupsRepository = new InMemoryGroupsRepository(
      inMemoryGroupItemsRepository,
    );

    sut = new ValidateManyPointsUseCase(
      inMemoryPointsRepository,
      inMemoryProjectsRepository,
      inMemoryUtilityPolesRepository,
      inMemoryCablesRepository,
      inMemoryMaterialsRepository,
      inMemoryGroupsRepository,
      inMemoryGroupItemsRepository,
    );
  });

  it("should be able to validate and parse multiple points successfully", async () => {
    const project = makeProject({}, new UniqueEntityID("project-1"));
    await inMemoryProjectsRepository.createMany([project]);

    const pole = makeUtilityPole(
      { lowVoltageLevelsCount: 2, mediumVoltageLevelsCount: 1 },
      new UniqueEntityID("pole-1"),
    );
    await inMemoryUtilityPolesRepository.createMany([pole]);

    const cableLow = makeCable({}, new UniqueEntityID("cable-low-1"));
    const cableMedium = makeCable({}, new UniqueEntityID("cable-med-1"));
    await inMemoryCablesRepository.createMany([cableLow, cableMedium]);

    const groupLow = makeGroup(
      { tension: { value: "LOW" } },
      new UniqueEntityID("group-low-1"),
    );
    const groupMed = makeGroup(
      { tension: { value: "MEDIUM" } },
      new UniqueEntityID("group-med-1"),
    );
    await inMemoryGroupsRepository.createMany([groupLow, groupMed]);

    const material = makeMaterial({}, new UniqueEntityID("mat-1"));
    await inMemoryMaterialsRepository.createMany([material]);

    const result = await sut.execute({
      projectId: "project-1",
      points: [
        {
          name: "Point A",
          description: "Testing point A",
          pointUtilityPole: {
            utilityPoleId: "pole-1",
            isNew: true,
          },
          pointCables: {
            lowTensionCables: {
              entranceCable: { cableId: "cable-low-1", isNew: true },
            },
            mediumTensionCables: {
              entranceCable: { cableId: "cable-med-1", isNew: false },
            },
          },
          pointGroups: [
            { groupId: "group-low-1", tensionLevel: "LOW", level: 1 },
            { groupId: "group-med-1", tensionLevel: "MEDIUM", level: 1 },
          ],
          untiedMaterials: [{ materialId: "mat-1", quantity: 5 }],
        },
      ],
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.project.id.toString()).toEqual("project-1");
      expect(result.value.parsedPoints).toHaveLength(1);

      const parsedPoint = result.value.parsedPoints[0];
      expect(parsedPoint.point.name).toEqual("Point A");
      expect(parsedPoint.pointUtilityPole.utilityPole.id.toString()).toEqual(
        "pole-1",
      );
      expect(
        parsedPoint.pointCables.lowTensionCables?.entranceCable.cable.id.toString(),
      ).toEqual("cable-low-1");
      expect(parsedPoint.pointGroupsWithItems).toHaveLength(2);
      expect(parsedPoint.pointUntiedMaterials).toHaveLength(1);
    }
  });

  it("should return ResourceNotFoundError if project does not exist", async () => {
    const result = await sut.execute({
      projectId: "non-existent-project",
      points: [],
    });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toBeInstanceOf(ResourceNotFoundError);
    expect((result.value as ResourceNotFoundError).message).toEqual(
      "Project does not exist",
    );
  });

  it("should return NotAllowedError if there are duplicate names in the request", async () => {
    const result = await sut.execute({
      projectId: "project-1",
      points: [
        {
          name: "Duplicate Name",
          pointUtilityPole: { utilityPoleId: "any", isNew: true },
          pointCables: {},
        },
        {
          name: "Duplicate Name",
          pointUtilityPole: { utilityPoleId: "any", isNew: true },
          pointCables: {},
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain("Duplicate point name found");
    }
  });

  it("should return AlreadyRegisteredError if point name already exists in the project", async () => {
    const project = makeProject({}, new UniqueEntityID("project-1"));
    await inMemoryProjectsRepository.createMany([project]);

    const existingPoint = makePoint({
      name: "Existing Point",
      projectId: new UniqueEntityID("project-1"),
    });
    await inMemoryPointsRepository.createMany([existingPoint]);

    const result = await sut.execute({
      projectId: "project-1",
      points: [
        {
          name: "Existing Point",
          pointUtilityPole: { utilityPoleId: "any", isNew: true },
          pointCables: {},
          pointGroups: [],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toContain(
        "Point names already registered in this project",
      );
    }
  });

  it("should return ResourceNotFoundError if resources (Pole, Cable, Group, Material) are missing", async () => {
    const project = makeProject({}, new UniqueEntityID("project-1"));
    await inMemoryProjectsRepository.createMany([project]);

    const result = await sut.execute({
      projectId: "project-1",
      points: [
        {
          name: "Point with missing resources",
          pointUtilityPole: { utilityPoleId: "missing-pole", isNew: true },
          pointCables: {
            lowTensionCables: {
              entranceCable: { cableId: "missing-cable", isNew: true },
            },
          },
          pointGroups: [
            { groupId: "missing-group", tensionLevel: "LOW", level: 1 },
          ],
          untiedMaterials: [{ materialId: "missing-material", quantity: 1 }],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);

      const errorMessage = result.value.message;
      const isResourceError =
        errorMessage.includes("Utility poles not found") ||
        errorMessage.includes("Cables not found") ||
        errorMessage.includes("Groups not found") ||
        errorMessage.includes("Materials not found");

      expect(isResourceError).toBeTruthy();
    }
  });

  it("should return NotAllowedError if point exceeds utility pole voltage capacity", async () => {
    const project = makeProject({}, new UniqueEntityID("project-1"));
    await inMemoryProjectsRepository.createMany([project]);

    const weakPole = makeUtilityPole(
      { lowVoltageLevelsCount: 1 },
      new UniqueEntityID("pole-weak"),
    );
    await inMemoryUtilityPolesRepository.createMany([weakPole]);

    const group = makeGroup(
      { tension: { value: "LOW" } },
      new UniqueEntityID("group-1"),
    );
    await inMemoryGroupsRepository.createMany([group]);

    const result = await sut.execute({
      projectId: "project-1",
      points: [
        {
          name: "Overloaded Point",
          pointUtilityPole: { utilityPoleId: "pole-weak", isNew: true },
          pointCables: {},
          pointGroups: [
            { groupId: "group-1", tensionLevel: "LOW", level: 1 },
            { groupId: "group-1", tensionLevel: "LOW", level: 2 },
          ],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain(
        "has more low tension groups than supported by the utility pole",
      );
    }
  });

  it("should return NotAllowedError if requested group tension does not match entity tension", async () => {
    const project = makeProject({}, new UniqueEntityID("project-1"));
    await inMemoryProjectsRepository.createMany([project]);

    const pole = makeUtilityPole({}, new UniqueEntityID("pole-1"));
    await inMemoryUtilityPolesRepository.createMany([pole]);

    const groupMedium = makeGroup(
      { tension: { value: "MEDIUM" } },
      new UniqueEntityID("group-medium"),
    );
    await inMemoryGroupsRepository.createMany([groupMedium]);

    const result = await sut.execute({
      projectId: "project-1",
      points: [
        {
          name: "Mismatch Point",
          pointUtilityPole: { utilityPoleId: "pole-1", isNew: true },
          pointCables: {},
          pointGroups: [
            { groupId: "group-medium", tensionLevel: "LOW", level: 1 },
          ],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain("Group tension level mismatch");
    }
  });

  it("should return AlreadyRegisteredError for duplicate group levels within the same point", async () => {
    const result = await sut.execute({
      projectId: "project-1",
      points: [
        {
          name: "Point Duplicate Levels",
          pointUtilityPole: { utilityPoleId: "any", isNew: true },
          pointCables: {},
          pointGroups: [
            { groupId: "any-1", tensionLevel: "LOW", level: 1 },
            { groupId: "any-2", tensionLevel: "LOW", level: 1 },
          ],
        },
      ],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toContain(
        "Duplicate group level 1 found for tension level LOW",
      );
    }
  });
});
