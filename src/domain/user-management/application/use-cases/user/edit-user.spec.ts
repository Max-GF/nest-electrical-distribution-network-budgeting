import { UniqueEntityID } from "src/core/entities/unique-entity-id";
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
import { UserRole } from "../../../enterprise/entities/value-objects/user-roles";
import { EditUserUseCase } from "./edit-user";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryAvatarsRepository: InMemoryAvatarsRepository;
let fakeHasher: FakeHasher;
let sut: EditUserUseCase;

describe("Edit User", () => {
  beforeEach(() => {
    inMemoryBasesRepository = new InMemoryBasesRepository();
    inMemoryCompaniesRepository = new InMemoryCompaniesRepository(
      inMemoryBasesRepository,
    );
    inMemoryAvatarsRepository = new InMemoryAvatarsRepository();
    inMemoryUsersRepository = new InMemoryUsersRepository(
      inMemoryCompaniesRepository,
      inMemoryBasesRepository,
      inMemoryAvatarsRepository,
    );
    fakeHasher = new FakeHasher();
    sut = new EditUserUseCase(
      inMemoryCompaniesRepository,
      inMemoryBasesRepository,
      inMemoryUsersRepository,
      inMemoryAvatarsRepository,
      fakeHasher,
    );
  });

  it("should be able to edit a user", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("ADMIN"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const newUserProps = {
      name: "Jane Doe",
      email: "JaneDoe@email.com",
      password: "654321",
      role: "ADMIN",
      firstLogin: true,
      isActive: true,
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
    };

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([testUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0]).toEqual(testUser);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "ADMIN",

      baseId: newUserProps.baseId,
      companyId: newUserProps.companyId,
      email: newUserProps.email,
      password: newUserProps.password,
      name: newUserProps.name,
      role: newUserProps.role,
      isActive: newUserProps.isActive,
    });

    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(result.isRight()).toBeTruthy();
    if (result.isRight()) {
      expect(inMemoryUsersRepository.items[0]).toEqual(result.value.user);
    }
  });

  it("should not be able to edit user with NO provided infos", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("ADMIN"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([testUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0]).toEqual(testUser);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "ADMIN",
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("No entries provided");
    }
  });
  it("should not be able to edit a user with invalid role", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("ADMIN"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const newUserProps = {
      name: "Jane Doe",
      email: "JaneDoe@email.com",
      password: "654321",
      role: "SUPER-ADMIN",
      firstLogin: true,
      isActive: true,
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
    };

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([testUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0]).toEqual(testUser);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "ADMIN",

      baseId: newUserProps.baseId,
      companyId: newUserProps.companyId,
      email: newUserProps.email,
      password: newUserProps.password,
      name: newUserProps.name,
      role: newUserProps.role,
      isActive: newUserProps.isActive,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("The provided user role is invalid");
    }
  });
  it("should not be able to edit a user with a role that is superior that actual user role", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("COMMON"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const newUserProps = {
      name: "Jane Doe",
      email: "JaneDoe@email.com",
      password: "654321",
      role: "ADMIN",
      firstLogin: true,
      isActive: true,
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
    };

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([testUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0]).toEqual(testUser);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "COMMON",

      baseId: newUserProps.baseId,
      companyId: newUserProps.companyId,
      email: newUserProps.email,
      password: newUserProps.password,
      name: newUserProps.name,
      role: newUserProps.role,
      isActive: newUserProps.isActive,
    });
    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Invalid permission");
    }
  });
  it("should not be able to edit a user with already registered email", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("ADMIN"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const newUserProps = {
      name: "Jane Doe",
      email: "JaneDoe@email.com",
      password: "654321",
      role: "ADMIN",
      firstLogin: true,
      isActive: true,
      baseId: testBase.id.toString(),
      companyId: testCompany.id.toString(),
    };
    const userWithSameNewEmail = makeUser({
      email: newUserProps.email,
    });

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([testUser, userWithSameNewEmail]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(2);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "ADMIN",

      baseId: newUserProps.baseId,
      companyId: newUserProps.companyId,
      email: newUserProps.email,
      password: newUserProps.password,
      name: newUserProps.name,
      role: newUserProps.role,
      isActive: newUserProps.isActive,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(AlreadyRegisteredError);
      expect(result.value.message).toBe("Email already registered");
    }
  });
  it("should not be able to edit a user with non existing company", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("ADMIN"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const newUserProps = {
      name: "Jane Doe",
      email: "JaneDoe@email.com",
      password: "654321",
      role: "ADMIN",
      firstLogin: true,
      isActive: true,
      baseId: testBase.id.toString(),
      companyId: "non-existing-company-id",
    };

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([testUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0]).toEqual(testUser);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "ADMIN",

      baseId: newUserProps.baseId,
      companyId: newUserProps.companyId,
      email: newUserProps.email,
      password: newUserProps.password,
      name: newUserProps.name,
      role: newUserProps.role,
      isActive: newUserProps.isActive,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Company not found");
    }
  });
  it("should not be able to edit a user with non existing base", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("ADMIN"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const newUserProps = {
      name: "Jane Doe",
      email: "JaneDoe@email.com",
      password: "654321",
      role: "ADMIN",
      firstLogin: true,
      isActive: true,
      baseId: "non-existing-base-id",
      companyId: testCompany.id.toString(),
    };

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase]),
      inMemoryUsersRepository.createMany([testUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0]).toEqual(testUser);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "ADMIN",

      baseId: newUserProps.baseId,
      companyId: newUserProps.companyId,
      email: newUserProps.email,
      password: newUserProps.password,
      name: newUserProps.name,
      role: newUserProps.role,
      isActive: newUserProps.isActive,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Base not found");
    }
  });
  it("should not be able to edit user's base to one that's doesn't belong to actual user company", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testBase2 = makeBase({ companyId: new UniqueEntityID() });
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("ADMIN"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const newUserProps = {
      name: "Jane Doe",
      email: "JaneDoe@email.com",
      password: "654321",
      role: "ADMIN",
      firstLogin: true,
      isActive: true,
      baseId: testBase2.id.toString(),
      companyId: testCompany.id.toString(),
    };

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase, testBase2]),
      inMemoryUsersRepository.createMany([testUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0]).toEqual(testUser);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "ADMIN",

      baseId: newUserProps.baseId,
      email: newUserProps.email,
      password: newUserProps.password,
      name: newUserProps.name,
      role: newUserProps.role,
      isActive: newUserProps.isActive,
    });

    expect(result.isLeft()).toBeTruthy();
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Base doesn't belong to the given user company",
      );
    }
  });
  it("should not be able to edit a user with a base that doesn't belong to given companyId", async () => {
    const testCompany = makeCompany({});
    const testBase = makeBase({ companyId: testCompany.id });
    const testBase2 = makeBase({});
    const testUser = makeUser({
      cpf: Cpf.create("108.260.513-16"),
      name: "John Doe",
      email: "JohnDoe@email.com",
      password: await fakeHasher.hash("123456"),
      role: UserRole.create("ADMIN"),
      firstLogin: true,
      isActive: true,
      baseId: testBase.id,
      companyId: testCompany.id,
    });
    const newUserProps = {
      name: "Jane Doe",
      email: "JaneDoe@email.com",
      password: "654321",
      role: "ADMIN",
      firstLogin: true,
      isActive: true,
      baseId: testBase2.id.toString(),
      companyId: testCompany.id.toString(),
    };

    await Promise.all([
      inMemoryCompaniesRepository.createMany([testCompany]),
      inMemoryBasesRepository.createMany([testBase, testBase2]),
      inMemoryUsersRepository.createMany([testUser]),
    ]);
    expect(inMemoryUsersRepository.items).toHaveLength(1);
    expect(inMemoryUsersRepository.items[0]).toEqual(testUser);
    const result = await sut.execute({
      userId: testUser.id.toString(),
      actualUserRole: "ADMIN",

      baseId: newUserProps.baseId,
      companyId: newUserProps.companyId,
      email: newUserProps.email,
      password: newUserProps.password,
      name: newUserProps.name,
      role: newUserProps.role,
      isActive: newUserProps.isActive,
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
