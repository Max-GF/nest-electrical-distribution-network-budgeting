import { InMemoryPoleScrewsRepository } from "test/repositories/eletrical-distribution-budgeting/in-memory-pole-screws-repository";
import { CreateBulkOfPoleScrewsUseCase } from "./create-bulk-of-pole-screws";
import { CreatePoleScrewUseCaseRequest } from "./create-pole-screw";

let inMemoryPoleScrewsRepository: InMemoryPoleScrewsRepository;
let sut: CreateBulkOfPoleScrewsUseCase;

describe("Create bulk of Pole Screw", () => {
  beforeEach(() => {
    inMemoryPoleScrewsRepository = new InMemoryPoleScrewsRepository();
    sut = new CreateBulkOfPoleScrewsUseCase(inMemoryPoleScrewsRepository);
  });

  it("should be able to create a bulk of pole screws", async () => {
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(0);
    const poleScrewsToCreate: CreatePoleScrewUseCaseRequest[] = [];
    for (let i = 0; i < 10; i++) {
      poleScrewsToCreate.push({
        code: i + 1,
        description: `Pole Screw ${i + 1}`,
        lengthInMM: 1000 + i * 100,
        unit: "UND",
      });
      poleScrewsToCreate.push({
        code: i + 1,
        description: `Pole Screw ${i + 1}`,
        lengthInMM: -1,
        unit: "UND",
      });
      poleScrewsToCreate.push({
        code: i + 1,
        description: `Pole Screw ${i + 1}`,
        lengthInMM: 1000 + i * 200,
        unit: "UND",
      });
    }
    const result = await sut.execute(poleScrewsToCreate);
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(10);
    expect(result.value.created).toHaveLength(10);
    expect(result.value.failed).toHaveLength(20);
    expect(
      result.value.failed.filter(
        (item) => item.error.message === "PoleScrew code already registered",
      ),
    ).toHaveLength(10);
    expect(
      result.value.failed.filter(
        (item) =>
          item.error.message === "Pole Screw length must be greater than zero",
      ),
    ).toHaveLength(10);
  });
  it("should not throw error when empty array is given", async () => {
    const poleScrewsToCreate: CreatePoleScrewUseCaseRequest[] = [];
    expect(inMemoryPoleScrewsRepository.items).toHaveLength(0);
    await sut.execute(poleScrewsToCreate);
  });
});
