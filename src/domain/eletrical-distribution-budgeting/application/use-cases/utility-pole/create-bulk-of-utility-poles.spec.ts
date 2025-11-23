import { InMemoryUtilityPolesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-utility-poles-repository";
import { CreateBulkOfUtilityPolesUseCase } from "./create-bulk-of-utility-poles";
import { CreateUtilityPoleUseCaseRequest } from "./create-utility-pole";

let inMemoryUtilityPolesRepository: InMemoryUtilityPolesRepository;
let sut: CreateBulkOfUtilityPolesUseCase;

describe("Create bulk of Utility Poles", () => {
  beforeEach(() => {
    inMemoryUtilityPolesRepository = new InMemoryUtilityPolesRepository();
    sut = new CreateBulkOfUtilityPolesUseCase(inMemoryUtilityPolesRepository);
  });

  it("should be able to create a bulk of utility poles", async () => {
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    const utilityPolesToCreate: CreateUtilityPoleUseCaseRequest[] = [];
    for (let i = 0; i < 10; i++) {
      utilityPolesToCreate.push({
        code: 1000 + i,
        description: `Utility Pole ${i}`,
        unit: "UND",
        strongSideSectionMultiplier: 1.5,
        mediumVoltageLevelsCount: 3,
        mediumVoltageStartSectionLengthInMM: 2000,
        mediumVoltageSectionLengthAddBylevelInMM: 200,
        lowVoltageLevelsCount: 5,
        lowVoltageStartSectionLengthInMM: 3000,
        lowVoltageSectionLengthAddBylevelInMM: 300,
      });
      utilityPolesToCreate.push({
        code: 1010 + i,
        description: `Utility Pole ${i + 10}`,
        unit: "UND",
        strongSideSectionMultiplier: 0.9,
        mediumVoltageLevelsCount: 3,
        mediumVoltageStartSectionLengthInMM: 2000,
        mediumVoltageSectionLengthAddBylevelInMM: 200,
        lowVoltageLevelsCount: 5,
        lowVoltageStartSectionLengthInMM: 3000,
        lowVoltageSectionLengthAddBylevelInMM: 300,
      });
      utilityPolesToCreate.push({
        code: 1020 + i,
        description: `Utility Pole ${i + 20}`,
        unit: "UND",
        strongSideSectionMultiplier: 1.9,
        mediumVoltageLevelsCount: 0,
        mediumVoltageStartSectionLengthInMM: 2000,
        mediumVoltageSectionLengthAddBylevelInMM: 200,
        lowVoltageLevelsCount: 0,
        lowVoltageStartSectionLengthInMM: 3000,
        lowVoltageSectionLengthAddBylevelInMM: 300,
      });
      utilityPolesToCreate.push({
        code: 1030 + i,
        description: `Utility Pole ${i + 30}`,
        unit: "UND",
        strongSideSectionMultiplier: 1.9,
        mediumVoltageLevelsCount: 2,
        mediumVoltageStartSectionLengthInMM: -2000,
        mediumVoltageSectionLengthAddBylevelInMM: 200,
        lowVoltageLevelsCount: 2,
        lowVoltageStartSectionLengthInMM: 3000,
        lowVoltageSectionLengthAddBylevelInMM: 300,
      });
      utilityPolesToCreate.push({
        code: 1000 + i,
        description: `Utility Pole ${i + 40}`,
        unit: "UND",
        strongSideSectionMultiplier: 1.9,
        mediumVoltageLevelsCount: 2,
        mediumVoltageStartSectionLengthInMM: 2000,
        mediumVoltageSectionLengthAddBylevelInMM: 200,
        lowVoltageLevelsCount: 2,
        lowVoltageStartSectionLengthInMM: 3000,
        lowVoltageSectionLengthAddBylevelInMM: 300,
      });
    }
    const result = await sut.execute(utilityPolesToCreate);
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(10);
    expect(result.value.created).toHaveLength(10);
    expect(result.value.failed).toHaveLength(40);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          "One or more section length are less than zero",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          "Is not allowed to create a utility pole with strong side section multiplier less than 1",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          "Utility pole must have at least one level count",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) => item.error.message === "UtilityPole code already registered",
      ),
    ).toHaveLength(10);
  });
  it("should not throw error when empty array is given", async () => {
    const utilityPolesToCreate: CreateUtilityPoleUseCaseRequest[] = [];
    expect(inMemoryUtilityPolesRepository.items).toHaveLength(0);
    await sut.execute(utilityPolesToCreate);
  });
});
