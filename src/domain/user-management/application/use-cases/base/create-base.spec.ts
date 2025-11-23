import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { CreateBaseUseCase } from "./create-base";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let sut: CreateBaseUseCase;

describe("Create Base", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    sut = new CreateBaseUseCase(
      inMemoryCompaniesRepository,
      inMemoryBasesRepository,
    );
  });

  it("should be able to create a base", async () => {
    const testCompany = makeCompany({});
    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryBasesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      name: "Test Base",
      companyId: testCompany.id.toString(),
    });

    expect(inMemoryBasesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryBasesRepository.items[0]).toEqual(result.value.base);
    }
  });

  it("should not be able to create base with non existing company", async () => {
    expect(inMemoryBasesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      name: "Test Base",
      companyId: "non-existing-company-id",
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Company not found");
    }
  });
  it("should not be able to create a base with already registered base name in the same company", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({
      name: "Test Base",
      companyId: testCompany.id,
    });
    await Promise.all([
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryCompaniesRepository.createMany([testCompany]),
    ]);
    expect(inMemoryBasesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      name: "Test Base",
      companyId: testCompany.id.toString(),
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Base name already registered");
    }
  });
});
