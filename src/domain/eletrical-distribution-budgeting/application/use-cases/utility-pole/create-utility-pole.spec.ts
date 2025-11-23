import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { makeUtilityPole } from "test/factories/eletrical-distribution-budgeting/make-utility-pole";
import { InMemoryUtilityPolesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-utility-poles-repository";
import { CreateUtilityPoleUseCase } from "./create-utility-pole";

let inMemoryUtilityPolesRepository: InMemoryUtilityPolesRepository;
let sut: CreateUtilityPoleUseCase;

describe("Create Utility Pole", () => {
  beforeEach(() => {
    inMemoryUtilityPolesRepository = new InMemoryUtilityPolesRepository();
    sut = new CreateUtilityPoleUseCase(inMemoryUtilityPolesRepository);
  });

  it("should be able to create a utility pole - bt", async () => {
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    const result = await sut.execute({
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

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryUtilityPolesRepository.items[0]).toEqual(
        result.value.utilityPole,
      );
    }
  });
  it("should be able to create a utility pole - mt", async () => {
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "11/400 R Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 1,

      lowVoltageLevelsCount: 2,
      lowVoltageStartSectionLengthInMM: 5000,
      lowVoltageSectionLengthAddBylevelInMM: 1000,

      mediumVoltageLevelsCount: 2,
      mediumVoltageStartSectionLengthInMM: 6000,
      mediumVoltageSectionLengthAddBylevelInMM: 1000,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryUtilityPolesRepository.items[0]).toEqual(
        result.value.utilityPole,
      );
    }
  });
  it("should not be able to create a utility pole with negative section infos", async () => {
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "11/400 R Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 1,

      lowVoltageLevelsCount: 2,
      lowVoltageStartSectionLengthInMM: -1,
      lowVoltageSectionLengthAddBylevelInMM: 1000,

      mediumVoltageLevelsCount: 2,
      mediumVoltageStartSectionLengthInMM: 6000,
      mediumVoltageSectionLengthAddBylevelInMM: 1000,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NegativeScrewLengthError);
      expect(result.value.message).toBe(
        "One or more section length are less than zero",
      );
    }
  });
  it("should not be able to create a utility pole with strongside multiplier less than 1", async () => {
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "11/400 R Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 0.5,

      lowVoltageLevelsCount: 2,
      lowVoltageStartSectionLengthInMM: 5000,
      lowVoltageSectionLengthAddBylevelInMM: 1000,

      mediumVoltageLevelsCount: 2,
      mediumVoltageStartSectionLengthInMM: 6000,
      mediumVoltageSectionLengthAddBylevelInMM: 1000,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Is not allowed to create a utility pole with strong side section multiplier less than 1",
      );
    }
  });
  it("should not be able to create a utility pole with no level counts", async () => {
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      code: 123456,
      description: "11/400 R Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 1,

      lowVoltageLevelsCount: 0,
      lowVoltageStartSectionLengthInMM: 5000,
      lowVoltageSectionLengthAddBylevelInMM: 1000,

      mediumVoltageLevelsCount: 0,
      mediumVoltageStartSectionLengthInMM: 6000,
      mediumVoltageSectionLengthAddBylevelInMM: 1000,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Utility pole must have at least one level count",
      );
    }
  });
  it("should not be able to create two or more utility poles with same code", async () => {
    const alreadyRegisteredUtilityPole = makeUtilityPole({
      code: 123456,
    });
    await inMemoryUtilityPolesRepository.createMany([
      alreadyRegisteredUtilityPole,
    ]);
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      code: 123456,
      description: "11/400 R Utility Pole",
      unit: "UND",

      strongSideSectionMultiplier: 1,

      lowVoltageLevelsCount: 2,
      lowVoltageStartSectionLengthInMM: 5000,
      lowVoltageSectionLengthAddBylevelInMM: 1000,

      mediumVoltageLevelsCount: 2,
      mediumVoltageStartSectionLengthInMM: 6000,
      mediumVoltageSectionLengthAddBylevelInMM: 1000,
    });

    expect(inMemoryUtilityPolesRepository.items).toHaveLength(1);
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("UtilityPole code already registered");
    }
  });
});
