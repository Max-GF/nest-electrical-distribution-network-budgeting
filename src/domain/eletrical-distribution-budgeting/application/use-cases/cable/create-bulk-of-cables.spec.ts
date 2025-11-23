import { InMemoryCablesRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-cables-repository";
import { CreateBulkOfCablesUseCase } from "./create-bulk-of-cables";
import { CreateCableUseCaseRequest } from "./create-cable";

let inMemoryCablesRepository: InMemoryCablesRepository;
let sut: CreateBulkOfCablesUseCase;

describe("Create bulk of Pole Screw", () => {
  beforeEach(() => {
    inMemoryCablesRepository = new InMemoryCablesRepository();
    sut = new CreateBulkOfCablesUseCase(inMemoryCablesRepository);
  });

  it("should be able to create a bulk of cables", async () => {
    expect(inMemoryCablesRepository.items).toHaveLength(0);
    const cablesToCreate: CreateCableUseCaseRequest[] = [];
    for (let i = 0; i < 10; i++) {
      cablesToCreate.push({
        code: i + 1,
        description: `Cable ${i + 1}`,
        unit: "KG",
        tension: i % 2 === 0 ? "LOW" : "MEDIUM",
        sectionAreaInMM: 1000 + i * 200,
      });
      cablesToCreate.push({
        code: i + 100,
        description: `Cable ${i + 1}`,
        unit: "KG",
        sectionAreaInMM: -1,
        tension: i % 2 === 0 ? "LOW" : "MEDIUM",
      });
      cablesToCreate.push({
        code: i + 200,
        description: `Cable ${i + 1}`,
        unit: "KG",
        sectionAreaInMM: 1000 + i * 200,
        tension: "HIGH",
      });
      cablesToCreate.push({
        code: i + 1,
        description: `Cable ${i + 1}`,
        unit: "KG",
        sectionAreaInMM: 1000 + i * 200,
        tension: "LOW",
      });
    }
    const result = await sut.execute(cablesToCreate);
    expect(inMemoryCablesRepository.items).toHaveLength(10);
    expect(result.value.created).toHaveLength(10);
    expect(result.value.failed).toHaveLength(30);
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
          "Invalid tension level: HIGH. Valid values are: LOW, MEDIUM.",
      ),
    ).toHaveLength(10);
  });
  it("should not throw error when empty array is given", async () => {
    const cablesToCreate: CreateCableUseCaseRequest[] = [];
    expect(inMemoryCablesRepository.items).toHaveLength(0);
    await sut.execute(cablesToCreate);
  });
});
