import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makeCableConnector } from "test/factories/eletrical-distribution-budgeting/make-cable-connectors";
import { makeGroup } from "test/factories/eletrical-distribution-budgeting/make-group";
import { makeMaterial } from "test/factories/eletrical-distribution-budgeting/make-material";
import { makePoint } from "test/factories/eletrical-distribution-budgeting/make-point";
import { makePoleScrew } from "test/factories/eletrical-distribution-budgeting/make-pole-screw";
import { makeProject } from "test/factories/eletrical-distribution-budgeting/make-project";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { InMemoryCableConnectorsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cable-connectors-repository";
import { InMemoryPoleScrewsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-pole-screws-repository";
import { ParsedPointToCreate } from "../point/validate-many-points";
import { CalculateBudgetUseCase } from "./calculate-budget";

let inMemoryPoleScrewsRepository: InMemoryPoleScrewsRepository;
let inMemoryCableConnectorsRepository: InMemoryCableConnectorsRepository;
let sut: CalculateBudgetUseCase;

describe("Calculate Budget Use Case", () => {
  beforeEach(() => {
    inMemoryPoleScrewsRepository = new InMemoryPoleScrewsRepository();
    inMemoryCableConnectorsRepository = new InMemoryCableConnectorsRepository();
    sut = new CalculateBudgetUseCase(
      inMemoryPoleScrewsRepository,
      inMemoryCableConnectorsRepository,
    );
  });

  it("should calculate budget materials for a complete point successfully", async () => {
    const screwSmall = makePoleScrew(
      { lengthInMM: 150 },
      new UniqueEntityID("screw-150"),
    );
    const screwMedium = makePoleScrew(
      { lengthInMM: 250 },
      new UniqueEntityID("screw-250"),
    );
    const screwLarge = makePoleScrew(
      { lengthInMM: 400 },
      new UniqueEntityID("screw-400"),
    );
    await inMemoryPoleScrewsRepository.createMany([
      screwLarge,
      screwSmall,
      screwMedium,
    ]);

    const connector = makeCableConnector(
      {
        entranceMinValueMM: 10,
        entranceMaxValueMM: 50,
        exitMinValueMM: 10,
        exitMaxValueMM: 50,
      },
      new UniqueEntityID("connector-univ"),
    );
    await inMemoryCableConnectorsRepository.createMany([connector]);

    const project = makeProject({}, new UniqueEntityID("proj-1"));
    const point = makePoint({}, new UniqueEntityID("point-1"));
    const utilityPole = makeUtilityPole({}, new UniqueEntityID("pole-1"));

    vi.spyOn(utilityPole, "calculateSectionLengthInMM").mockReturnValue(200);

    const cableEntrance = makeCable(
      { sectionAreaInMM: 25 },
      new UniqueEntityID("cable-in"),
    );
    const cableExit = makeCable(
      { sectionAreaInMM: 25 },
      new UniqueEntityID("cable-out"),
    );
    const group = makeGroup({}, new UniqueEntityID("group-1"));
    const material = makeMaterial({}, new UniqueEntityID("mat-1"));

    const parsedPoint: ParsedPointToCreate = {
      point,
      pointUtilityPole: { isNew: true, utilityPole },
      pointCables: {
        lowTensionCables: {
          entranceCable: { isNew: true, cable: cableEntrance },
          exitCable: { isNew: false, cable: cableExit },
        },
      },
      pointUntiedMaterials: [{ material, quantity: 2 }],
      pointGroupsWithItems: [
        {
          group,
          level: 1,
          tensionLevel: "LOW",
          untiedMaterials: [
            GroupItem.createMaterial({
              groupId: group.id,
              materialId: material.id,
              quantity: 5,
              type: "material",
            }),
          ],
          poleScrews: [
            GroupItem.createPoleScrew({
              groupId: group.id,
              lengthAdd: 10, // 200mm (poste) + 10mm (add) = 210mm necessário. Deve pegar o parafuso de 250mm
              quantity: 1,
              type: "poleScrew",
            }),
          ],
          cableConnectors: [
            GroupItem.createCableConnector({
              groupId: group.id,
              quantity: 3,
              type: "cableConnector",
              localCableSectionInMM: 0,
              oneSideConnector: false,
            }),
          ],
        },
      ],
    };

    const result = await sut.execute({
      project,
      parsedPoints: [parsedPoint],
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const materials = result.value.projectMaterials;

      expect(materials).toHaveLength(
        1 + // Untied Material do Ponto
          1 + // Untied Material do Grupo
          1 + // Pole Screw
          1 + // Cable Connector
          1 + // Utility Pole (isNew: true)
          1, // Entrance Cable (isNew: true) - Exit cable isNew: false
      );

      const screwMaterial = materials.find((m) => m.itemType === "poleScrew");
      expect(screwMaterial).toBeDefined();
      expect(screwMaterial?.itemId.toString()).toEqual("screw-250");

      const connectorMaterial = materials.find(
        (m) => m.itemType === "cableConnector",
      );
      expect(connectorMaterial).toBeDefined();
      expect(connectorMaterial?.itemId.toString()).toEqual("connector-univ");

      const poleMaterial = materials.find((m) => m.itemType === "utilityPole");
      expect(poleMaterial?.itemId.toString()).toEqual("pole-1");
    }
  });

  it("should return ResourceNotFoundError if no suitable pole screw is found (too large required)", async () => {
    // Setup: Apenas parafusos pequenos
    await inMemoryPoleScrewsRepository.createMany([
      makePoleScrew({ lengthInMM: 100 }, new UniqueEntityID("small-screw")),
    ]);

    const project = makeProject({});
    const utilityPole = makeUtilityPole({});
    vi.spyOn(utilityPole, "calculateSectionLengthInMM").mockReturnValue(500); // Poste muito grosso

    const group = makeGroup({});

    const parsedPoint: ParsedPointToCreate = {
      point: makePoint({}),
      pointUtilityPole: { isNew: false, utilityPole },
      pointCables: {},
      pointUntiedMaterials: [],
      pointGroupsWithItems: [
        {
          group,
          level: 1,
          tensionLevel: "LOW",
          untiedMaterials: [],
          cableConnectors: [],
          poleScrews: [
            GroupItem.createPoleScrew({
              groupId: group.id,
              lengthAdd: 0,
              quantity: 1,
              type: "poleScrew",
            }),
          ],
        },
      ],
    };

    const result = await sut.execute({
      project,
      parsedPoints: [parsedPoint],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toContain("No suitable pole screw found");
    }
  });

  it("should return NotAllowedError if trying to calculate cable connectors without cables defined", async () => {
    await inMemoryCableConnectorsRepository.createMany([
      makeCableConnector({}),
    ]);

    const project = makeProject({});
    const group = makeGroup({});

    const parsedPoint: ParsedPointToCreate = {
      point: makePoint({}),
      pointUtilityPole: { isNew: false, utilityPole: makeUtilityPole({}) },
      pointCables: {},
      pointUntiedMaterials: [],
      pointGroupsWithItems: [
        {
          group,
          level: 1,
          tensionLevel: "LOW",
          untiedMaterials: [],
          poleScrews: [],
          cableConnectors: [
            GroupItem.createCableConnector({
              groupId: group.id,
              quantity: 1,
              type: "cableConnector",
              localCableSectionInMM: 0,
              oneSideConnector: false,
            }),
          ],
        },
      ],
    };

    const result = await sut.execute({
      project,
      parsedPoints: [parsedPoint],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain(
        "No cables available for tension level LOW",
      );
    }
  });

  it("should return NotAllowedError for two-side connector without exit cable", async () => {
    await inMemoryCableConnectorsRepository.createMany([
      makeCableConnector({}),
    ]);

    const project = makeProject({});
    const group = makeGroup({});
    const cableEntrance = makeCable({ sectionAreaInMM: 50 });

    const parsedPoint: ParsedPointToCreate = {
      point: makePoint({}),
      pointUtilityPole: { isNew: false, utilityPole: makeUtilityPole({}) },
      pointCables: {
        mediumTensionCables: {
          entranceCable: { cable: cableEntrance, isNew: false },
        },
      },
      pointUntiedMaterials: [],
      pointGroupsWithItems: [
        {
          group,
          level: 1,
          tensionLevel: "MEDIUM",
          untiedMaterials: [],
          poleScrews: [],
          cableConnectors: [
            GroupItem.createCableConnector({
              groupId: group.id,
              quantity: 1,
              type: "cableConnector",
              oneSideConnector: false,
              localCableSectionInMM: 0,
            }),
          ],
        },
      ],
    };

    const result = await sut.execute({
      project,
      parsedPoints: [parsedPoint],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain("Exit cable section is required");
    }
  });

  it("should return ResourceNotFoundError if no suitable cable connector matches dimensions", async () => {
    // Repo tem apenas conectores pequenos (max 10mm)
    await inMemoryCableConnectorsRepository.createMany([
      makeCableConnector(
        { entranceMaxValueMM: 10 },
        new UniqueEntityID("small-conn"),
      ),
    ]);

    const project = makeProject({});
    const group = makeGroup({});
    // Cabo de 100mm (muito grande)
    const cableEntrance = makeCable({ sectionAreaInMM: 100 });

    const parsedPoint: ParsedPointToCreate = {
      point: makePoint({}),
      pointUtilityPole: { isNew: false, utilityPole: makeUtilityPole({}) },
      pointCables: {
        lowTensionCables: {
          entranceCable: { cable: cableEntrance, isNew: false },
        },
      },
      pointUntiedMaterials: [],
      pointGroupsWithItems: [
        {
          group,
          level: 1,
          tensionLevel: "LOW",
          untiedMaterials: [],
          poleScrews: [],
          cableConnectors: [
            GroupItem.createCableConnector({
              groupId: group.id,
              quantity: 1,
              type: "cableConnector",
              localCableSectionInMM: 0,
              oneSideConnector: true, // Ignora saída, mas entrada falhará
            }),
          ],
        },
      ],
    };

    const result = await sut.execute({
      project,
      parsedPoints: [parsedPoint],
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toContain(
        "No suitable cable connector found",
      );
    }
  });
});
