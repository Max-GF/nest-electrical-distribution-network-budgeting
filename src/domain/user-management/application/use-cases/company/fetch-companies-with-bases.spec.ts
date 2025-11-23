import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { Base } from "../../../enterprise/entities/base";
import { FetchCompaniesWithBasesUseCase } from "./fetch-companies-with-bases";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let sut: FetchCompaniesWithBasesUseCase;

describe("Fetch Companies with bases", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    sut = new FetchCompaniesWithBasesUseCase(inMemoryCompaniesRepository);
  });

  it("should be able to fetch companies with bases", async () => {
    expect(inMemoryCompaniesRepository.items).toHaveLength(0);

    const testCompanies = Array.from({ length: 20 }, () => makeCompany());
    const testBases: Base[] = [];
    testCompanies.forEach((company) => {
      testBases.push(
        ...Array.from({ length: 5 }, () =>
          makeBase({
            companyId: company.id,
          }),
        ),
      );
    });

    await Promise.all([
      inMemoryCompaniesRepository.createMany(testCompanies),
      inMemoryBasesRepository.createMany(testBases),
    ]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(20);

    const result = await sut.execute();

    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCompaniesRepository.items.length).toEqual(
        result.value.companies.length,
      );
      result.value.companies.forEach((company) => {
        expect(company.bases.length).toEqual(5);
      });
    }
  });
});
