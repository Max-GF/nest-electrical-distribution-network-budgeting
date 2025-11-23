import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { TokenExpiredError } from "src/core/errors/errors-user-management/token-expired-error";
import { WrongCredentialsError } from "src/core/errors/errors-user-management/wrong-credentials-error";
import { CacheRepository } from "src/infra/cache/cache-repository";
import { Encrypter } from "../../cryptography/encrypter";
import { UsersRepository } from "../../repositories/users-repository";

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  type: "refreshToken";
}
interface CachedTokenData {
  id: string;
  userId: string;
  expiresAt: Date;
  isRevoked: boolean;
}
interface RefreshAccessTokenUseCaseRequest {
  refreshToken: string;
}

type RefreshAccessTokenUseCaseResponse = Either<
  | WrongCredentialsError
  | NotAllowedError
  | TokenExpiredError
  | ResourceNotFoundError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private encrypter: Encrypter,
    private cacheRepository: CacheRepository,
  ) {}

  async execute({
    refreshToken,
  }: RefreshAccessTokenUseCaseRequest): Promise<RefreshAccessTokenUseCaseResponse> {
    let payload: Record<string, unknown>;
    try {
      payload = await this.encrypter.decrypt(refreshToken);
      this.isPayloadARefreshToken(payload);
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        return left(
          new TokenExpiredError("Token has expired. Please log in again."),
        );
      }
      if (error instanceof NotAllowedError) {
        return left(
          new NotAllowedError("Provided token is not a refresh token."),
        );
      }

      return left(
        new WrongCredentialsError("Invalid token. Please log in again."),
      );
    }
    const cachedToken = await this.getParsedCachedToken(payload.jti);

    if (!cachedToken) {
      return left(new ResourceNotFoundError("Unrecognized refresh token."));
    }

    if (cachedToken.isRevoked) {
      return left(
        new NotAllowedError("This token has already been used and revoked."),
      );
    }
    if (cachedToken.expiresAt.getTime() < Date.now()) {
      return left(
        new TokenExpiredError("Token has expired. Please log in again."),
      );
    }
    if (cachedToken.userId !== payload.sub) {
      return left(
        new WrongCredentialsError("This token does not belong to the user."),
      );
    }
    const user = await this.usersRepository.findById(payload.sub);

    if (!user || !user.isActive) {
      return left(new ResourceNotFoundError("User not found or inactive."));
    }

    const newAccessToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
        role: user.role.value,
        baseId: user.baseId.toString(),
        companyId: user.companyId.toString(),
        type: "accessToken",
      },
      "30m",
    );

    const newRefreshTokenId = randomUUID();
    const newRefreshToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
        jti: newRefreshTokenId,
        type: "refreshToken",
      },
      "5h",
    );
    await this.updateCacheTokens(
      cachedToken.id,
      newRefreshTokenId,
      user.id.toString(),
    );

    return right({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  }

  isPayloadARefreshToken(
    payload: unknown,
  ): asserts payload is RefreshTokenPayload {
    if (typeof payload !== "object" || payload === null) {
      throw new Error("Invalid token");
    }
    if (
      !Object.prototype.hasOwnProperty.call(payload, "sub") ||
      typeof (payload as { sub: unknown }).sub !== "string"
    ) {
      throw new Error(
        "Invalid payload: the property 'sub' is missing or not a string.",
      );
    }

    if (
      !Object.prototype.hasOwnProperty.call(payload, "jti") ||
      typeof (payload as { jti: unknown }).jti !== "string"
    ) {
      throw new Error(
        "Invalid payload: the property 'jti' is missing or not a string.",
      );
    }

    if (
      !Object.prototype.hasOwnProperty.call(payload, "type") ||
      (payload as { type: unknown }).type !== "refreshToken"
    ) {
      throw new NotAllowedError("Provided token is not a refresh token.");
    }
  }

  async getParsedCachedToken(
    refreshTokenJti: string,
  ): Promise<CachedTokenData | null> {
    const cachedToken = await this.cacheRepository.get(
      `refreshToken:${refreshTokenJti}`,
    );
    if (!cachedToken) {
      return null;
    }
    const parsedCachedToken = this.parseCachedToken(cachedToken);
    if (!parsedCachedToken) {
      return null;
    }
    return parsedCachedToken;
  }
  parseCachedToken(cachedToken: string): CachedTokenData | null {
    const parsedCachedToken = JSON.parse(cachedToken, (key, value) => {
      if (key === "expiresAt" && typeof value === "string") {
        return new Date(value);
      }
      return value;
    });
    if (!parsedCachedToken) {
      return null;
    }
    const keysOfParsedCachedToken = Object.keys(parsedCachedToken);
    const expectedKeys: (keyof CachedTokenData)[] = [
      "expiresAt",
      "id",
      "isRevoked",
      "userId",
    ];
    if (
      keysOfParsedCachedToken.length !== expectedKeys.length ||
      !keysOfParsedCachedToken.every((key) =>
        expectedKeys.includes(key as keyof CachedTokenData),
      )
    ) {
      return null;
    }

    return parsedCachedToken as CachedTokenData;
  }

  async updateCacheTokens(
    oldTokenId: string,
    newTokenId: string,
    userId: string,
  ): Promise<void> {
    await this.cacheRepository.delete(`refreshToken:${oldTokenId}`);
    await Promise.all([
      this.cacheRepository.set(
        `refreshToken:${oldTokenId}`,
        JSON.stringify({
          id: oldTokenId,
          userId: userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 15),
          isRevoked: true,
        }),
      ),
      this.cacheRepository.set(
        `refreshToken:${newTokenId}`,
        JSON.stringify({
          id: newTokenId,
          userId: userId,
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 5),
          isRevoked: false,
        }),
        1000 * 60 * 60 * 5,
      ),
    ]);
  }
}
