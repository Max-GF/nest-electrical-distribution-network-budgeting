import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { WrongCredentialsError } from "src/core/errors/errors-user-management/wrong-credentials-error";
import { FakeCacheRepository } from "test/cache/fake-cache-repository";
import { FakeEncrypter } from "test/cryptography/fake-encrypter";
import { FakeHasher } from "test/cryptography/fake-hasher";
import { makeUser } from "test/factories/user-management/make-user";
import { InMemoryAvatarsRepository } from "test/repositories/user-management/in-memory-avatars-repository";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { InMemoryUsersRepository } from "test/repositories/user-management/in-memory-users-repository";
import { AuthenticateUserUseCase } from "./authenticate-user";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryAvatarsRepository: InMemoryAvatarsRepository;
let fakeHasher: FakeHasher;
let fakeEncrypter: FakeEncrypter;
let fakeCacheRepository: FakeCacheRepository;
let sut: AuthenticateUserUseCase;

describe("Authenticate Student", () => {
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
    fakeEncrypter = new FakeEncrypter();
    fakeCacheRepository = new FakeCacheRepository();
    sut = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
      fakeHasher,
      fakeEncrypter,
      fakeCacheRepository,
    );
  });

  it("Should be able to authenticate a user with email", async () => {
    const testUser = makeUser({
      password: "123456",
      isActive: true,
    });
    testUser.password = await fakeHasher.hash(testUser.password);
    await inMemoryUsersRepository.createMany([testUser]);

    const result = await sut.execute({
      email: testUser.email,
      password: "123456",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    if (result.isRight()) {
      const refreshTokenAsJson = JSON.parse(result.value.refreshToken);
      expect(
        await fakeCacheRepository.get(`refreshToken:${refreshTokenAsJson.jti}`),
      ).toEqual(expect.any(String));
    }
  });

  it("Should be able to authenticate a user with cpf", async () => {
    const testUser = makeUser({
      password: "123456",
      isActive: true,
    });
    testUser.password = await fakeHasher.hash(testUser.password);
    await inMemoryUsersRepository.createMany([testUser]);

    const result = await sut.execute({
      cpf: testUser.cpf.value,
      password: "123456",
    });

    expect(result.isRight()).toBe(true);
    expect(result.value).toEqual({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    if (result.isRight()) {
      const refreshTokenAsJson = JSON.parse(result.value.refreshToken);
      expect(
        await fakeCacheRepository.get(`refreshToken:${refreshTokenAsJson.jti}`),
      ).toEqual(expect.any(String));
    }
  });
  it("Should not be able to authenticate a user with wrong password", async () => {
    const testUser = makeUser({
      password: "123456",
      isActive: true,
    });
    testUser.password = await fakeHasher.hash(testUser.password);
    await inMemoryUsersRepository.createMany([testUser]);

    const result = await sut.execute({
      cpf: testUser.cpf.value,
      password: "654321",
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(WrongCredentialsError);
      expect(result.value.message).toBe("Credentials are not valid.");
    }
  });
  it("Should not be able to authenticate a user with non registered email", async () => {
    const testUser = makeUser({
      password: await fakeHasher.hash("123456"),
    });
    await inMemoryUsersRepository.createMany([testUser]);

    const result = await sut.execute({
      email: "testUser@email.com",
      password: "123456",
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(WrongCredentialsError);
      expect(result.value.message).toBe(
        "The provided cpf/email was not found.",
      );
    }
  });
  it("Should not be able to authenticate a user with empty entries", async () => {
    const testUser = makeUser({
      password: "123456",
    });
    testUser.password = await fakeHasher.hash(testUser.password);
    await inMemoryUsersRepository.createMany([testUser]);

    const result = await sut.execute({
      password: "123456",
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Email or CPF must be provided.");
    }
  });
  it("Should not be able to authenticate a user with a invalid cpf", async () => {
    const testUser = makeUser({
      password: "123456",
    });
    testUser.password = await fakeHasher.hash(testUser.password);
    await inMemoryUsersRepository.createMany([testUser]);

    const result = await sut.execute({
      cpf: "0123456789",
      password: "123456",
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe("Invalid CPF");
    }
  });
});
