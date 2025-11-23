import { InMemoryMaterialsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-materials-repository";
import { CreateBulkOfMaterialsUseCase } from "./create-bulk-of-materials";
import { CreateMaterialUseCaseRequest } from "./create-material";

let inMemoryMaterialsRepository: InMemoryMaterialsRepository;
let sut: CreateBulkOfMaterialsUseCase;

describe("Create bulk of Material", () => {
  beforeEach(() => {
    inMemoryMaterialsRepository = new InMemoryMaterialsRepository();
    sut = new CreateBulkOfMaterialsUseCase(inMemoryMaterialsRepository);
  });

  it("should be able to create a bulk of materials", async () => {
    expect(inMemoryMaterialsRepository.items).toHaveLength(0);
    const materialsToCreate: CreateMaterialUseCaseRequest[] = [];
    for (let i = 0; i < 10; i++) {
      materialsToCreate.push({
        code: i + 1,
        description: `Material ${i + 1}`,
        unit: "UND",
        tension: i % 2 === 0 ? "low" : "medium",
      });
      materialsToCreate.push({
        code: i + 1,
        description: `Material ${i + 1}`,
        unit: "UND",
        tension: "medium",
      });
      materialsToCreate.push({
        code: i + 1000,
        description: `Material ${i + 1}`,
        unit: "UND",
        tension: "high",
      });
    }
    const result = await sut.execute(materialsToCreate);
    expect(inMemoryMaterialsRepository.items).toHaveLength(10);
    expect(result.value.created).toHaveLength(10);
    expect(result.value.failed).toHaveLength(20);
    expect(
      result.value.failed.filter(
        (item) => item.error.message === "Material code already registered",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message ===
          `Invalid tension level: high. Valid values are: LOW, MEDIUM.`,
      ),
    ).toHaveLength(10);
  });
  it("should not throw error when empty array is given", async () => {
    const materialsToCreate: CreateMaterialUseCaseRequest[] = [];
    expect(inMemoryMaterialsRepository.items).toHaveLength(0);
    await sut.execute(materialsToCreate);
  });
});
