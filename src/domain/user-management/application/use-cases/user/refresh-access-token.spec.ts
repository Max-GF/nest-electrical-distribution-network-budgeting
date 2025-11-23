import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { TokenExpiredError } from "src/core/errors/errors-user-management/token-expired-error";
import { WrongCredentialsError } from "src/core/errors/errors-user-management/wrong-credentials-error";
import { FakeCacheRepository } from "test/cache/fake-cache-repository";
import { FakeEncrypter } from "test/cryptography/fake-encrypter";
import { makeUser } from "test/factories/user-management/make-user";
import { InMemoryAvatarsRepository } from "test/repositories/user-management/in-memory-avatars-repository";
import { InMemoryBasesRepository } from "test/repositories/user-management/in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "test/repositories/user-management/in-memory-companies-repository";
import { InMemoryUsersRepository } from "test/repositories/user-management/in-memory-users-repository";
import { RefreshAccessTokenUseCase } from "./refresh-access-token";

let inMemoryCompaniesRepository: InMemoryCompaniesRepository;
let inMemoryBasesRepository: InMemoryBasesRepository;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryAvatarsRepository: InMemoryAvatarsRepository;
let fakeEncrypter: FakeEncrypter;
let fakeCacheRepository: FakeCacheRepository;
let sut: RefreshAccessTokenUseCase;

describe("Refresh access token", () => {
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
    fakeEncrypter = new FakeEncrypter();
    fakeCacheRepository = new FakeCacheRepository();
    sut = new RefreshAccessTokenUseCase(
      inMemoryUsersRepository,
      fakeEncrypter,
      fakeCacheRepository,
    );
  });

  it("Should be able to refresh an access token", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "300000",
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 5),
        isRevoked: false,
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);
    const result = await sut.execute({
      refreshToken: testRefreshToken,
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

  it("Should not be able to refresh an access token with one access token", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "accessToken",
      },
      "300000",
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 5),
        isRevoked: false,
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);
    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "Provided token is not a refresh token.",
      );
    }
  });
  it("Should not be able to refresh an access token with one incorrectly structured refresh token", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        userId: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "300000",
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 5),
        isRevoked: false,
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);
    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(WrongCredentialsError);
      expect(result.value.message).toBe("Invalid token. Please log in again.");
    }
  });
  it("Should not be able to refresh an access token with one expired refresh token", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "-300000", // Setting a negative expiration time to simulate an expired token
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 5),
        isRevoked: false,
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);
    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(TokenExpiredError);
      expect(result.value.message).toBe(
        "Token has expired. Please log in again.",
      );
    }
  });
  it("Should not be able to refresh an access token with one expired refresh token - double check with cached info", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "300000",
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() - 60 * 60 * 1000 * 5), // Setting a negative expiration time to simulate an expired token
        isRevoked: false,
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);
    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(TokenExpiredError);
      expect(result.value.message).toBe(
        "Token has expired. Please log in again.",
      );
    }
  });
  it("Should not be able to refresh an access token with one unexpected refresh token", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "300000",
    );

    await inMemoryUsersRepository.createMany([testUser]);
    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("Unrecognized refresh token.");
    }
  });
  it("Should not be able to refresh an access token with one revoked refresh token", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "300000",
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 5),
        isRevoked: true, // Simulating a revoked token
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);
    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "This token has already been used and revoked.",
      );
    }
  });
  it("Should not be able to refresh an access token twice with one refresh token", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "300000",
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 5),
        isRevoked: false,
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);
    await sut.execute({
      refreshToken: testRefreshToken,
    });
    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(NotAllowedError);
      expect(result.value.message).toBe(
        "This token has already been used and revoked.",
      );
    }
  });
  it("Should not be able to refresh an access token with one refresh token from inactive user", async () => {
    const testUser = makeUser({ isActive: false });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: testUser.id.toString(),
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "300000",
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 5),
        isRevoked: false,
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);

    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });

    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError);
      expect(result.value.message).toBe("User not found or inactive.");
    }
  });
  it("Should not be able to refresh an access token with one refresh token from other user", async () => {
    const testUser = makeUser({ isActive: true });
    const testRefreshTokenId = "testRefreshTokenId";
    const testRefreshToken = await fakeEncrypter.encrypt(
      {
        sub: "otherUserId",
        jti: testRefreshTokenId,
        type: "refreshToken",
      },
      "300000",
    );
    await fakeCacheRepository.set(
      `refreshToken:${testRefreshTokenId}`,
      JSON.stringify({
        id: testRefreshTokenId,
        userId: testUser.id.toString(),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000 * 5),
        isRevoked: false,
      }),
    );
    await inMemoryUsersRepository.createMany([testUser]);

    const result = await sut.execute({
      refreshToken: testRefreshToken,
    });
    expect(result.isLeft()).toBe(true);
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(WrongCredentialsError);
      expect(result.value.message).toBe(
        "This token does not belong to the user.",
      );
    }
  });
});
