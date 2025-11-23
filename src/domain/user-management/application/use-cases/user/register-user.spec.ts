import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { makeBase } from "test/factories/user-management/make-base";
import { makeCompany } from "test/factories/user-management/make-company";
import { makeUser } from "test/factories/user-management/make-user";
import { InMemoryAvatarsRepository } from "test/repositories/user-management/in-memory-avatars-repository";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { InMemoryUsersRepository } from "test/repositories/user-management/in-memory-users-repository";
import { Cpf } from "../../../enterprise/entities/value-objects/cpf";
import { RegisterUserUseCase } from "./register-user";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryAvatarsRepository: InMemoryAvatarsRepository;

let fakeHasher: FakeHasher;
let sut: RegisterUserUseCase;

describe("Register User", () => {
  beforeEach(() => {
    inMemoryAvatarsRepository = new InMemoryAvatarsRepository();
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    inMemoryUsersRepository = new InMemoryUsersRepository(
      inMemoryCompaniesRepository,
      inMemoryBasesRepository,
      inMemoryAvatarsRepository,
    );
    fakeHasher = new FakeHasher();
    sut = new RegisterUserUseCase(
      inMemoryCompaniesRepository,
      inMemoryBasesRepository,
      inMemoryUsersRepository,
      inMemoryAvatarsRepository,
      fakeHasher,
    );
  });

  it("should be able to register a user", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(0);
    const result = await sut.execute({
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
      email: "JohnDoe@example.com",
      password: "123456",
      name: "John Doe",
      role: "ADMIN",
      cpf: "108.260.513-16",
    });

    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryUsersRepository.items[0]).toEqual(result.value.user);
    }
  });

  it("should not be able to create user with invalid role", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(0);
    const result = await sut.execute({
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
      email: "JohnDoe@example.com",
      password: "123456",
      name: "John Doe",
      role: "INVALID_ROLE",
      cpf: "108.260.513-16",
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Invalid user role");
    }
  });
  it("should not be able to create a user with invalid cpf", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(0);
    const result = await sut.execute({
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
      email: "JohnDoe@example.com",
      password: "123456",
      name: "John Doe",
      role: "ADMIN",
      cpf: "111.111.111-11",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Invalid CPF");
    }
  });
  it("should not be able to create a user with already registered email", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const alreadyRegisteredUser = makeUser({
      email: "JohnDoe@example.com",
    });

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([alreadyRegisteredUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    const result = await sut.execute({
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
      email: "JohnDoe@example.com",
      password: "123456",
      name: "John Doe",
      role: "ADMIN",
      cpf: "108.260.513-16",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Email already registered");
    }
  });
  it("should not be able to create a user with already registered cpf", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const alreadyRegisteredUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
    });

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([alreadyRegisteredUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    const result = await sut.execute({
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
      email: "JohnDoe@example.com",
      password: "123456",
      name: "John Doe",
      role: "ADMIN",
      cpf: "108.260.513-16",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("CPF already registered");
    }
  });
  it("should not be able to create a user with non existing company", async () => {
    const testBase = makeBase({});
    await inMemoryBasesRepository.createMany([testBase]);
    expect(inMemoryUsersRepository.items).toHaveLength(0);
    const result = await sut.execute({
      baseId: testBase.id.toString(),
      companyId: "non-existing-company-id",
      email: "JohnDoe@example.com",
      password: "123456",
      name: "John Doe",
      role: "ADMIN",
      cpf: "108.260.513-16",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Company not found");
    }
  });
  it("should not be able to create a user with non existing base", async () => {
    const testCompany = makeCompany({});
    await inMemoryCompaniesRepository.createMany([testCompany]);
    expect(inMemoryUsersRepository.items).toHaveLength(0);
    const result = await sut.execute({
      baseId: "non-existing-base-id",
      companyId: testCompany.id.toString(),
      email: "JohnDoe@example.com",
      password: "123456",
      name: "John Doe",
      role: "ADMIN",
      cpf: "108.260.513-16",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Base not found");
    }
  });
  it("should not be able to create a user with a base that doesn't belong to given companyId", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({});
    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(0);
    const result = await sut.execute({
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
      email: "JohnDoe@example.com",
      password: "123456",
      name: "John Doe",
      role: "ADMIN",
      cpf: "108.260.513-16",
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Base doesn't belong to the given company",
      );
    }
  });
});
