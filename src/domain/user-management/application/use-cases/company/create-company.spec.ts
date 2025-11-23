import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { makeCompany } from "test/factories/user-management/make-company";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { CreateCompanyUseCase } from "./create-company";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let sut: CreateCompanyUseCase;

describe("Create Company", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    sut = new CreateCompanyUseCase(inMemoryCompaniesRepository);
  });

  it("should be able to create a company", async () => {
    expect(inMemoryCompaniesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      cnpj: "01.860.395/0001-65",
      name: "Test Company",
    });

    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCompaniesRepository.items[0]).toEqual(
        result.value.company,
      );
    }
  });

  it("should not be able to create company with invalid cnpj", async () => {
    expect(inMemoryCompaniesRepository.items).toHaveLength(0);
    const result = await sut.execute({
      cnpj: "01.234.567/0001-89",
      name: "Test Company",
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Invalid CNPJ");
    }
  });
  it("should not be able to create a company with already registered cnpj", async () => {
    const testCompany = makeCompany({});
    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      name: "Test Company",
      cnpj: testCompany.cnpj.value,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("CNPJ already registered");
    }
  });
  it("should not be able to create a company with already registered name", async () => {
    const testCompany = makeCompany({});
    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    const result = await sut.execute({
      name: testCompany.name,
      cnpj: "01.860.395/0001-65",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Company name already registered");
    }
  });
});
