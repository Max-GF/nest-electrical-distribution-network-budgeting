import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { makeBase } from "test/factories/user-management/make-base";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { EditBaseUseCase } from "./edit-base";

let inMemoryBasesRepository: InMemoryBasesRepository;
let sut: EditBaseUseCase;

describe("Edit Base", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    sut = new EditBaseUseCase(inMemoryBasesRepository);
  });

  it("should be able to edit a base", async () => {
    const testBase = makeBase({
      name: "Old Base Name",
    });

    await inMemoryBasesRepository.createMany([testBase]);
    expect(inMemoryBasesRepository.items).toHaveLength(1);
    expect(inMemoryBasesRepository.items[0].name).toEqual("Old Base Name");

    const newBaseProps = {
      name: "New Base Name",
    };

    const result = await sut.execute({
      actualUserCompanyId: testBase.companyId.toString(),
      baseId: testBase.id.toString(),
      name: newBaseProps.name,
    });

    expect(inMemoryBasesRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryBasesRepository.items[0]).toEqual(result.value.base);
      expect(result.value.base.name).toEqual("New Base Name");
    }
  });

  it("should not be able to edit a base from another company", async () => {
    const testBase = makeBase({
      name: "Old Base Name",
    });

    await inMemoryBasesRepository.createMany([testBase]);
    expect(inMemoryBasesRepository.items).toHaveLength(1);
    expect(inMemoryBasesRepository.items[0].name).toEqual("Old Base Name");

    const newBaseProps = {
      name: "New Base Name",
    };

    const result = await sut.execute({
      actualUserCompanyId: "Other-Company-Id",
      baseId: testBase.id.toString(),
      name: newBaseProps.name,
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "You are not allowed to edit a base from another company.",
      );
    }
  });
  it("should not be able to edit a non existing base", async () => {
    const result = await sut.execute({
      actualUserCompanyId: "Other-Company-Id",
      baseId: "non-existing-base-id",
      name: "New Base Name",
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Base not found.");
    }
  });
  it("should not be able to edit a company with invalid cnpj", async () => {
    const testBase = makeBase({
      name: "Old Base Name",
    });
    const testBase2 = makeBase({
      companyId: testBase.companyId,
      name: "New Base Name",
    });

    await inMemoryBasesRepository.createMany([testBase, testBase2]);
    expect(inMemoryBasesRepository.items).toHaveLength(2);

    const newBaseProps = {
      name: "New Base Name",
    };

    const result = await sut.execute({
      actualUserCompanyId: testBase.companyId.toString(),
      baseId: testBase.id.toString(),
      name: newBaseProps.name,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Base with this name already exists.");
    }
  });
});
