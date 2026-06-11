import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";
import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { CreateBulkOfCablesUseCase } from "./create-bulk-of-cables";
import { CreateCableUseCaseRequest } from "./create-cable";

let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: CreateBulkOfCablesUseCase;

describe("Create bulk of Cables", () => {
  beforeEach(() => {
    inMemoryCablesRepository = new InMemoryCablesRepository();
    sut = new CreateBulkOfCablesUseCase(inMemoryCablesRepository);
  });

  it("should be able to create a bulk of cables", async () => {
    expect(inMemoryCablesRepository.items).toHaveLength(0);
    const cablesToCreate: CreateCableUseCaseRequest[] = [];
    for (let i = 0; i < 10; i++) {
      // Valid cables (M unit)
      cablesToCreate.push({
        code: i + 1,
        description: `Cable ${i + 1}`,
        unit: "M",
        tension: i % 2 === 0 ? "LOW" : "MEDIUM",
        sectionAreaInMM: 1000 + i * 200,
      });
      // Valid cables (KG unit + factor)
      cablesToCreate.push({
        code: i + 500,
        description: `Cable KG ${i + 1}`,
        unit: "KG",
        tension: "LOW",
        sectionAreaInMM: 1000 + i * 200,
        meterToKgConversionFactor: 0.1,
      });
      // Invalid: Negative section area
      cablesToCreate.push({
        code: i + 100,
        description: `Cable ${i + 1}`,
        unit: "M",
        sectionAreaInMM: -1,
        tension: i % 2 === 0 ? "LOW" : "MEDIUM",
      });
      // Invalid: Invalid tension
      cablesToCreate.push({
        code: i + 200,
        description: `Cable ${i + 1}`,
        unit: "M",
        sectionAreaInMM: 1000 + i * 200,
        tension: "HIGH",
      });
      // Invalid: Duplicate code
      cablesToCreate.push({
        code: i + 1,
        description: `Cable ${i + 1}`,
        unit: "M",
        sectionAreaInMM: 1000 + i * 200,
        tension: "LOW",
      });
      // Invalid: Unit KG without factor
      cablesToCreate.push({
        code: i + 600,
        description: `Cable KG No Factor ${i + 1}`,
        unit: "KG",
        tension: "LOW",
        sectionAreaInMM: 1000 + i * 200,
      });
      // Invalid: Invalid unit
      cablesToCreate.push({
        code: i + 700,
        description: `Cable Invalid Unit ${i + 1}`,
        unit: "INVALID",
        tension: "LOW",
        sectionAreaInMM: 1000 + i * 200,
      });
    }
    const result = await sut.execute(cablesToCreate);
    expect(inMemoryCablesRepository.items).toHaveLength(20);
    expect(result.value.created).toHaveLength(20);
    expect(result.value.failed).toHaveLength(50);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message === "Cable section area must be greater than zero",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          `Invalid tension level: HIGH. Valid values are: ${TensionLevel.VALID_VALUES.join(", ")}.`,
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) => item.error.message === "Cable code already registered",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          "Meter to kg conversion factor must be provided when unit is KG",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter((item) =>
        item.error.message.includes("Invalid unit"),
      ),
    ).toHaveLength(10);
  });
  it("should not throw error when empty array is given", async () => {
    const cablesToCreate: CreateCableUseCaseRequest[] = [];
    expect(inMemoryCablesRepository.items).toHaveLength(0);
    await sut.execute(cablesToCreate);
  });
});
