import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { User } from "../../../enterprise/entities/base-user";
import { Cpf } from "../../../enterprise/entities/value-objects/cpf";
import { UserRole } from "../../../enterprise/entities/value-objects/user-roles";
import { HashGenerator } from "../../cryptography/hash-generator";
import { AvatarsRepository } from "../../repositories/avatars-repository";
import { BasesRepository } from "../../repositories/bases-repository";
import { CompaniesRepository } from "../../repositories/companies-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface RegisterUserUseCaseRequest {
  cpf: string;

  name: string;
  email: string;
  password: string;
  role: string;

  baseId: string;
  companyId: string;

  avatarId?: string;
}

type RegisterUserUseCaseResponse = Either<
  AlreadyRegisteredError | ResourceNotFoundError | NotAllowedError,
  {
    user: User;
  }
>;

@Injectable()
export class RegisterUserUseCase {
  constructor(
    private companiesRepository: CompaniesRepository,
    private basesRepository: BasesRepository,
    private usersRepository: UsersRepository,
    private avatarsRepository: AvatarsRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute({
    cpf,
    name,
    email,
    password,
    role,
    baseId,
    companyId,
    avatarId,
  }: RegisterUserUseCaseRequest): Promise<RegisterUserUseCaseResponse> {
    if (!Cpf.isValid(cpf)) {
      return left(new NotAllowedError("Invalid CPF"));
    }
    if (!UserRole.isValid(role)) {
      return left(new NotAllowedError("Invalid user role"));
    }

    const userWithSameEmail = await this.usersRepository.findByEmail(email);
    if (userWithSameEmail) {
      return left(new AlreadyRegisteredError("Email already registered"));
    }
    const userWithSameCpf = await this.usersRepository.findByCpf(
      Cpf.normalize(cpf),
    );
    if (userWithSameCpf) {
      return left(new AlreadyRegisteredError("CPF already registered"));
    }
    if (avatarId) {
      const userAvatar = await this.avatarsRepository.findById(avatarId);
      if (!userAvatar) {
        return left(new ResourceNotFoundError("Avatar not found"));
      }
    }
    const company = await this.companiesRepository.findById(companyId);
    if (!company) {
      return left(new ResourceNotFoundError("Company not found"));
    }
    const base = await this.basesRepository.findById(baseId);
    if (!base) {
      return left(new ResourceNotFoundError("Base not found"));
    }
    if (base.companyId.toString() !== companyId) {
      return left(
        new NotAllowedError("Base doesn't belong to the given company"),
      );
    }

    const hashedPassword = await this.hashGenerator.hash(password);

    const user = User.create({
      cpf: Cpf.create(cpf),
      name,
      email,
      password: hashedPassword,
      role: UserRole.create(role),
      baseId: new UniqueEntityID(baseId),
      companyId: new UniqueEntityID(companyId),
      avatarId: avatarId ? new UniqueEntityID(avatarId) : undefined,
    });
    await this.usersRepository.createMany([user]);

    return right({
      user,
    });
  }
}
