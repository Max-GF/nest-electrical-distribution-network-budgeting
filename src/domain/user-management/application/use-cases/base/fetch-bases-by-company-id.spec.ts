import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { makeBase } from "test/factories/user-management/make-base";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { FetchBasesByCompanyIdUseCase } from "./fetch-bases-by-company-id";

let inMemoryBasesRepository: InMemoryBasesRepository;
let sut: FetchBasesByCompanyIdUseCase;

describe("Fetch Bases", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    sut = new FetchBasesByCompanyIdUseCase(inMemoryBasesRepository);
  });

  it("should be able to fetch Bases by companyId", async () => {
    expect(inMemoryBasesRepository.items).toHaveLength(0);
    const testbases = Array.from({ length: 20 }, () =>
      makeBase({ companyId: new UniqueEntityID("Test Company") }),
    );
    await inMemoryBasesRepository.createMany(testbases);
    expect(inMemoryBasesRepository.items).toHaveLength(20);

    const result = await sut.execute({
      companyId: "Test Company",
    });

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryBasesRepository.items.length).toEqual(
        result.value.bases.length,
      );
    }
  });
});
