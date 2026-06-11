import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { makeCable } from "test/factories/eletrical-distribution-budgeting/make-cable";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { EditCableUseCase } from "./edit-cable";

let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: EditCableUseCase;

describe("Edit Cable", () => {
  beforeEach(() => {
    inMemoryCablesRepository = new InMemoryCablesRepository();
    sut = new EditCableUseCase(inMemoryCablesRepository);
  });

  it("should be able to edit a cable", async () => {
    const cableToEdit = makeCable({
      code: 123456,
      description: "3000mm Cable",
      unit: "M",
      sectionAreaInMM: 3000,
      tension: TensionLevel.create("LOW"),
    });
    await inMemoryCablesRepository.createMany([cableToEdit]);
    expect(inMemoryCablesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      cableId: cableToEdit.id.toString(),
      description: "4000mm Cable",
      unit: "KG",
      sectionAreaInMM: 4000,
      tension: "MEDIUM",
      meterToKgConversionFactor: 0.2,
    });

    expect(inMemoryCablesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCablesRepository.items[0]).toEqual(result.value.cable);
      expect(inMemoryCablesRepository.items[0].description).toBe(
        "4000MM CABLE",
      );
      expect(inMemoryCablesRepository.items[0].tension.value).toBe("MEDIUM");
      expect(inMemoryCablesRepository.items[0].unit).toBe("KG");
      expect(inMemoryCablesRepository.items[0].meterToKgConversionFactor).toBe(
        0.2,
      );
    }
  });

  it("should not be able to edit unit to KG without factor (if original was M)", async () => {
    const cableToEdit = makeCable({ unit: "M" });
    await inMemoryCablesRepository.createMany([cableToEdit]);

    const result = await sut.execute({
      cableId: cableToEdit.id.toString(),
      unit: "KG",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toContain(
        "Meter to kg conversion factor must be provided",
      );
    }
  });

  it("should clear conversion factor when changing unit to M", async () => {
    const cableToEdit = makeCable({
      unit: "KG",
      meterToKgConversionFactor: 0.5,
    });
    await inMemoryCablesRepository.createMany([cableToEdit]);

    const result = await sut.execute({
      cableId: cableToEdit.id.toString(),
      unit: "M",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(result.value.cable.unit).toBe("M");
      expect(result.value.cable.meterToKgConversionFactor).toBeUndefined();
    }
  });

  it("should not be able to edit a cable with negative length", async () => {
    const cableToEdit = makeCable({
      code: 123456,
      description: "3000mm Cable",
      unit: "M",
      sectionAreaInMM: 3000,
    });
    await inMemoryCablesRepository.createMany([cableToEdit]);
    expect(inMemoryCablesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      cableId: cableToEdit.id.toString(),
      description: "4000mm Cable",
      unit: "KG",
      sectionAreaInMM: -4000,
    });

    expect(inMemoryCablesRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NegativeCableSectionError);
      expect(result.value.message).toBe(
        "Cable section area must be greater than zero",
      );
    }
  });

  it("should not be able to edit unexisting cable", async () => {
    const result = await sut.execute({
      cableId: "unexisting-id",
      description: "4000mm Cable",
    });

    expect(inMemoryCablesRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Given cable was not found");
    }
  });
  it("should not be able to edit a cable when no entries was given", async () => {
    const cableToEdit = makeCable({
      code: 123456,
      description: "3000mm Cable",
    });
    await inMemoryCablesRepository.createMany([cableToEdit]);
    expect(inMemoryCablesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      cableId: cableToEdit.id.toString(),
    });

    expect(inMemoryCablesRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("No entries provided");
    }
  });
});
