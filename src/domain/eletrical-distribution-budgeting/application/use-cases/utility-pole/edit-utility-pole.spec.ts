import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { InMemoryUtilityPolesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-utility-poles-repository";
import { EditUtilityPoleUseCase } from "./edit-utility-pole";

let inMemoryUtilityPolesRepository: InMemoryUtilityPolesRepository;
let sut: EditUtilityPoleUseCase;

describe("Edit Utility Pole", () => {
  beforeEach(() => {
    inMemoryUtilityPolesRepository = new InMemoryUtilityPolesRepository();
    sut = new EditUtilityPoleUseCase(inMemoryUtilityPolesRepository);
  });

  it("should be able to edit a utility pole", async () => {
    const utilityPoleToEdit = makeUtilityPole({
      code: 123456,
      description: "9/400 DT Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 1.5,

      lowVoltageLevelsCount: 2,
      lowVoltageSectionLengthAddBylevelInMM: 1000,
      lowVoltageStartSectionLengthInMM: 5000,

      mediumVoltageLevelsCount: 0,
      mediumVoltageSectionLengthAddBylevelInMM: 0,
      mediumVoltageStartSectionLengthInMM: 0,
    });
    await inMemoryUtilityPolesRepository.createMany([utilityPoleToEdit]);
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      utilityPoleId: utilityPoleToEdit.id.toString(),
      description: "11/600 R Utility Pole",
      unit: "UND 2",

      strongSideSectionMultiplier: 1.2,

      lowVoltageLevelsCount: 3,
      lowVoltageSectionLengthAddBylevelInMM: 1500,
      lowVoltageStartSectionLengthInMM: 5500,

      mediumVoltageLevelsCount: 4,
      mediumVoltageSectionLengthAddBylevelInMM: 1000,
      mediumVoltageStartSectionLengthInMM: 8000,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryUtilityPolesRepository.items[0]).toEqual(
        result.value.utilityPole,
      );
    }
  });
  it("should not be able to edit a utility pole with negative section infos", async () => {
    const utilityPoleToEdit = makeUtilityPole({
      code: 123456,
      description: "9/400 DT Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 1.5,

      lowVoltageLevelsCount: 2,
      lowVoltageSectionLengthAddBylevelInMM: 1000,
      lowVoltageStartSectionLengthInMM: 5000,

      mediumVoltageLevelsCount: 0,
      mediumVoltageSectionLengthAddBylevelInMM: 0,
      mediumVoltageStartSectionLengthInMM: 0,
    });
    await inMemoryUtilityPolesRepository.createMany([utilityPoleToEdit]);
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      utilityPoleId: utilityPoleToEdit.id.toString(),
      description: "11/600 R Utility Pole",
      unit: "UND 2",

      strongSideSectionMultiplier: 1.2,

      lowVoltageLevelsCount: 3,
      lowVoltageSectionLengthAddBylevelInMM: -1500,
      lowVoltageStartSectionLengthInMM: 5500,

      mediumVoltageLevelsCount: 0,
      mediumVoltageSectionLengthAddBylevelInMM: 0,
      mediumVoltageStartSectionLengthInMM: 0,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NegativeScrewLengthError);
      expect(result.value.message).toBe(
        "One or more section length values are less than zero",
      );
    }
  });
  it("should not be able to edit a utility pole with strongside multiplier less than 1", async () => {
    const utilityPoleToEdit = makeUtilityPole({
      code: 123456,
      description: "9/400 DT Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 1.5,

      lowVoltageLevelsCount: 2,
      lowVoltageSectionLengthAddBylevelInMM: 1000,
      lowVoltageStartSectionLengthInMM: 5000,

      mediumVoltageLevelsCount: 0,
      mediumVoltageSectionLengthAddBylevelInMM: 0,
      mediumVoltageStartSectionLengthInMM: 0,
    });
    await inMemoryUtilityPolesRepository.createMany([utilityPoleToEdit]);
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      utilityPoleId: utilityPoleToEdit.id.toString(),
      description: "11/600 R Utility Pole",
      unit: "UND 2",

      strongSideSectionMultiplier: 0.9,

      lowVoltageLevelsCount: 3,
      lowVoltageSectionLengthAddBylevelInMM: 1500,
      lowVoltageStartSectionLengthInMM: 5500,

      mediumVoltageLevelsCount: 0,
      mediumVoltageSectionLengthAddBylevelInMM: 0,
      mediumVoltageStartSectionLengthInMM: 0,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Is not allowed to edit a utility pole with strong side section multiplier less than 1",
      );
    }
  });
  it("should not be able to edit a utility pole with no level count", async () => {
    const utilityPoleToEdit = makeUtilityPole({
      code: 123456,
      description: "9/400 DT Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 1.5,

      lowVoltageLevelsCount: 2,
      lowVoltageStartSectionLengthInMM: 5000,
      lowVoltageSectionLengthAddBylevelInMM: 1000,

      mediumVoltageLevelsCount: 1,
      mediumVoltageStartSectionLengthInMM: 6000,
      mediumVoltageSectionLengthAddBylevelInMM: 1000,
    });
    await inMemoryUtilityPolesRepository.createMany([utilityPoleToEdit]);
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);

    const result = await sut.execute({
      utilityPoleId: utilityPoleToEdit.id.toString(),
      description: "11/600 R Utility Pole",
      unit: "UND 2",

      strongSideSectionMultiplier: 2,

      lowVoltageLevelsCount: 0,
      lowVoltageSectionLengthAddBylevelInMM: 1500,
      lowVoltageStartSectionLengthInMM: 5500,

      mediumVoltageLevelsCount: 0,
      mediumVoltageSectionLengthAddBylevelInMM: 0,
      mediumVoltageStartSectionLengthInMM: 0,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Utility pole must have at least one level count",
      );
    }
  });
  it("should not be able to edit a utility pole with no entries", async () => {
    const result = await sut.execute({
      utilityPoleId: "123456",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("No entries provided");
    }
  });
  it("should not be able to edit a unexisting utility pole", async () => {
    const result = await sut.execute({
      utilityPoleId: "UnexistingUtilityPoleId",
      description: "11/600 R Utility Pole",
      unit: "UND 2",

      strongSideSectionMultiplier: 1.2,

      lowVoltageLevelsCount: 3,
      lowVoltageSectionLengthAddBylevelInMM: 1500,
      lowVoltageStartSectionLengthInMM: 5500,

      mediumVoltageLevelsCount: 0,
      mediumVoltageSectionLengthAddBylevelInMM: 0,
      mediumVoltageStartSectionLengthInMM: 0,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Given utility pole was not found");
    }
  });
});
