import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { WrongCredentialsError } from "src/core/errors/errors-user-management/wrong-credentials-error";
import { CacheRepository } from "src/infra/cache/cache-repository";
import { Cpf } from "../../../enterprise/entities/value-objects/cpf";
import { Encrypter } from "../../cryptography/encrypter";
import { HashComparer } from "../../cryptography/hash-comparer";
import { UsersRepository } from "../../repositories/users-repository";

interface AuthenticateUserUseCaseRequest {
  email?: string;
  cpf?: string;
  password: string;
}

type AuthenticateUserUseCaseResponse = Either<
  WrongCredentialsError | NotAllowedError,
  {
    accessToken: string;
    refreshToken: string;
  }
>;

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    private usersRepository: UsersRepository,
    private hashComparer: HashComparer,
    private encrypter: Encrypter,
    private cacheRepository: CacheRepository,
  ) {}

  async execute({
    email,
    cpf,
    password,
  }: AuthenticateUserUseCaseRequest): Promise<AuthenticateUserUseCaseResponse> {
    if (!email && !cpf) {
      return left(new NotAllowedError("Email or CPF must be provided."));
    }
    if (cpf && !Cpf.isValid(cpf)) {
      return left(new NotAllowedError("Invalid CPF"));
    }
    const user =
      email !== undefined
        ? await this.usersRepository.findByEmail(email)
        : cpf !== undefined
          ? await this.usersRepository.findByCpf(Cpf.normalize(cpf))
          : undefined;

    if (!user || !user.isActive) {
      return left(
        new WrongCredentialsError("The provided cpf/email was not found."),
      );
    }

    const isPasswordValid = await this.hashComparer.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      return left(new WrongCredentialsError("Credentials are not valid."));
    }

    const accessToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
        role: user.role.value,
        baseId: user.baseId.toString(),
        companyId: user.companyId.toString(),
        type: "accessToken",
      },
      "30m", // Adjust the expiration time as needed, use ms string notation like "1h", "30m", etc. check https://github.com/vercel/ms for more information
    );
    const refreshTokenId = randomUUID();
    const refreshToken = await this.encrypter.encrypt(
      {
        sub: user.id.toString(),
        jti: refreshTokenId,
        type: "refreshToken",
      },
      "5h",
    );
    await this.cacheRepository.set(
      `refreshToken:${refreshTokenId}`,
      JSON.stringify({
        id: refreshTokenId,
        userId: user.id.toString(),
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 5), // 5 hours expiration
        isRevoked: false,
      }),
      1000 * 60 * 60 * 5, // 5 hours on cache
    );

    return right({
      accessToken,
      refreshToken,
    });
  }
}
