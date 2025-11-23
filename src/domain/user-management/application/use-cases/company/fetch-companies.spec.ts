import { makeCompany } from "test/factories/user-management/make-company";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { FetchCompaniesUseCase } from "./fetch-companies";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let sut: FetchCompaniesUseCase;

describe("Fetch Companies", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    sut = new FetchCompaniesUseCase(inMemoryCompaniesRepository);
  });

  it("should be able to fetch companies", async () => {
    expect(inMemoryCompaniesRepository.items).toHaveLength(0);

    const testCompanies = Array.from({ length: 20 }, () => makeCompany());
    await inMemoryCompaniesRepository.createMany(testCompanies);
    expect(inMemoryCompaniesRepository.items).toHaveLength(20);

    const result = await sut.execute();

    expect(inMemoryCompaniesRepository.items).toHaveLength(20);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCompaniesRepository.items.length).toEqual(
        result.value.companies.length,
      );
    }
  });
});
