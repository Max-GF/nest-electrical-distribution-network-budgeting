import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { makePoint } from "test/factories/eletrical-distribution-budgeting/make-point";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { InMemoryPointsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-points-repository";
import { InMemoryProjectsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-projects-repository";
import { InMemoryUtilityPolesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-utility-poles-repository";
import { EditPointUseCase } from "./edit-point";

let inMemoryProjectsRepository: InMemoryProjectsRepository;

let inMemoryPointsRepository: InMemoryPointsRepository;
let inMemoryUtilityPolesRepository: InMemoryUtilityPolesRepository;
let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: EditPointUseCase;

describe("Edit Point", () => {
  beforeEach(() => {
    inMemoryProjectsRepository = new InMemoryProjectsRepository();
    inMemoryUtilityPolesRepository = new InMemoryUtilityPolesRepository();
    inMemoryCablesRepository = new InMemoryCablesRepository();
    inMemoryPointsRepository = new InMemoryPointsRepository(
      inMemoryCablesRepository,
      inMemoryProjectsRepository,
      inMemoryUtilityPolesRepository,
    );
    sut = new EditPointUseCase(
      inMemoryPointsRepository,
      inMemoryUtilityPolesRepository,
      inMemoryCablesRepository,
    );
  });

  it("should be able to edit a point", async () => {
    const point = makePoint();
    inMemoryPointsRepository.createMany([point]);

    const utilityPole = makeUtilityPole();
    inMemoryUtilityPolesRepository.createMany([utilityPole]);

    const cable = makeCable();
    inMemoryCablesRepository.createMany([cable]);

    const result = await sut.execute({
      pointId: point.id.toString(),
      description: "New Description",
      utilityPoleId: utilityPole.id.toString(),
      lowTensionEntranceCableId: cable.id.toString(),
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      const editedPoint = inMemoryPointsRepository.items[0];
      expect(editedPoint.description).toBe("New Description");
      expect(editedPoint.utilityPoleId?.toString()).toBe(
        utilityPole.id.toString(),
      );
      expect(editedPoint.lowTensionEntranceCableId?.toString()).toBe(
        cable.id.toString(),
      );
    }
  });

  it("should not be able to edit a non-existing point", async () => {
    const result = await sut.execute({
      pointId: "non-existing-point",
      description: "any",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Point does not exist");
    }
  });

  it("should not be able to edit with a non-existing utility pole", async () => {
    const point = makePoint();
    inMemoryPointsRepository.createMany([point]);

    const result = await sut.execute({
      pointId: point.id.toString(),
      utilityPoleId: "non-existing-pole",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Given utility pole does not exist");
    }
  });

  it("should not be able to edit with a non-existing cable", async () => {
    const point = makePoint();
    inMemoryPointsRepository.createMany([point]);

    const result = await sut.execute({
      pointId: point.id.toString(),
      lowTensionEntranceCableId: "non-existing-cable",
      lowTensionExitCableId: "non-existing-cable-2",
      mediumTensionExitCableId: "non-existing-cable-3",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe(
        "Cables not found: non-existing-cable, non-existing-cable-2, non-existing-cable-3",
      );
    }
  });

  it("should return an error if no fields are provided to edit", async () => {
    const point = makePoint();
    inMemoryPointsRepository.createMany([point]);

    const result = await sut.execute({
      pointId: point.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "At least one field must be provided to edit",
      );
    }
  });

  it("should return an error if all fields are the same", async () => {
    const point = makePoint({ description: "Same Description" });
    inMemoryPointsRepository.createMany([point]);

    const result = await sut.execute({
      pointId: point.id.toString(),
      description: "Same Description",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "At least one field must be different to edit",
      );
    }
  });
});
