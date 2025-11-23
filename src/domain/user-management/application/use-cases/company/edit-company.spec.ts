import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { makeCompany } from "test/factories/user-management/make-company";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { Cnpj } from "../../../enterprise/entities/value-objects/cnpj";
import { EditCompanyUseCase } from "./edit-company";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let sut: EditCompanyUseCase;

describe("Edit Company", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    sut = new EditCompanyUseCase(inMemoryCompaniesRepository);
  });

  it("should be able to edit a company", async () => {
    const testCompany = makeCompany({
      name: "Old Company Name",
      cnpj: Cnpj.create("58.177.714/0001-50"),
    });

    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    expect(inMemoryCompaniesRepository.items[0]).toEqual(testCompany);

    const newCompanyProps = {
      name: "New Company Name",
      cnpj: "21.839.762/0001-56",
    };

    const result = await sut.execute({
      companyId: testCompany.id.toString(),
      actualUserCompanyId: testCompany.id.toString(),
      name: newCompanyProps.name,
      cnpj: newCompanyProps.cnpj,
    });

    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryCompaniesRepository.items[0]).toEqual(
        result.value.company,
      );
    }
  });

  it("should not be able to edit company with NO provided infos", async () => {
    const testCompany = makeCompany({
      name: "Old Company Name",
      cnpj: Cnpj.create("58.177.714/0001-50"),
    });

    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    expect(inMemoryCompaniesRepository.items[0]).toEqual(testCompany);

    const newCompanyProps = {
      name: undefined,
      cnpj: undefined,
    };

    const result = await sut.execute({
      companyId: testCompany.id.toString(),
      actualUserCompanyId: testCompany.id.toString(),
      name: newCompanyProps.name,
      cnpj: newCompanyProps.cnpj,
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("No entries provided");
    }
  });
  it("should not be able to edit a non existing company", async () => {
    const testCompany = makeCompany({
      name: "Old Company Name",
      cnpj: Cnpj.create("58.177.714/0001-50"),
    });

    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    expect(inMemoryCompaniesRepository.items[0]).toEqual(testCompany);

    const newCompanyProps = {
      name: "New Company Name",
      cnpj: "21.839.762/0001-56",
    };

    const result = await sut.execute({
      companyId: "non-existing-company-id",
      actualUserCompanyId: "non-existing-company-id",
      name: newCompanyProps.name,
      cnpj: newCompanyProps.cnpj,
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Company not found");
    }
  });
  it("should not be able to edit a company with invalid cnpj", async () => {
    const testCompany = makeCompany({
      name: "Old Company Name",
      cnpj: Cnpj.create("58.177.714/0001-50"),
    });

    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    expect(inMemoryCompaniesRepository.items[0]).toEqual(testCompany);

    const newCompanyProps = {
      name: "New Company Name",
      cnpj: "11.111.111/1111-11",
    };

    const result = await sut.execute({
      companyId: testCompany.id.toString(),
      actualUserCompanyId: testCompany.id.toString(),
      name: newCompanyProps.name,
      cnpj: newCompanyProps.cnpj,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Invalid CNPJ");
    }
  });
  it("should not be able to edit a company that user don't belong to", async () => {
    const testCompany = makeCompany({
      name: "Old Company Name",
      cnpj: Cnpj.create("58.177.714/0001-50"),
    });

    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(1);
    expect(inMemoryCompaniesRepository.items[0]).toEqual(testCompany);

    const newCompanyProps = {
      name: "New Company Name",
      cnpj: "21.839.762/0001-56",
    };

    const result = await sut.execute({
      companyId: testCompany.id.toString(),
      actualUserCompanyId: "non-existing-company-id",
      name: newCompanyProps.name,
      cnpj: newCompanyProps.cnpj,
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "You cannot edit a company you don't belong to",
      );
    }
  });
  it("should not be able to edit a company name to one already in use", async () => {
    const testCompany = makeCompany({
      name: "Old Company Name",
      cnpj: Cnpj.create("58.177.714/0001-50"),
    });
    const testCompany2 = makeCompany({
      name: "New Company Name",
    });

    await inMemoryCompaniesRepository.createMany([testCompany, testCompany2]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(2);
    expect(inMemoryCompaniesRepository.items[0]).toEqual(testCompany);

    const newCompanyProps = {
      name: "New Company Name",
      cnpj: "21.839.762/0001-56",
    };

    const result = await sut.execute({
      companyId: testCompany.id.toString(),
      actualUserCompanyId: testCompany.id.toString(),
      name: newCompanyProps.name,
      cnpj: newCompanyProps.cnpj,
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Company name already registered");
    }
  });
  it("should not be able to edit a company cnpj to one already in use", async () => {
    const testCompany = makeCompany({
      name: "Old Company Name",
      cnpj: Cnpj.create("58.177.714/0001-50"),
    });
    const testCompany2 = makeCompany({
      cnpj: Cnpj.create("21.839.762/0001-56"),
    });

    await inMemoryCompaniesRepository.createMany([testCompany, testCompany2]);
    expect(inMemoryCompaniesRepository.items).toHaveLength(2);
    expect(inMemoryCompaniesRepository.items[0]).toEqual(testCompany);

    const newCompanyProps = {
      name: "New Company Name",
      cnpj: "21.839.762/0001-56",
    };

    const result = await sut.execute({
      companyId: testCompany.id.toString(),
      actualUserCompanyId: testCompany.id.toString(),
      name: newCompanyProps.name,
      cnpj: newCompanyProps.cnpj,
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("CNPJ already registered");
    }
  });
});
