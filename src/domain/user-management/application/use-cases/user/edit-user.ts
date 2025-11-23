import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { User } from "../../../enterprise/entities/base-user";
import {
  UserRole,
  UserRoleEntries,
} from "../../../enterprise/entities/value-objects/user-roles";
import { HashGenerator } from "../../cryptography/hash-generator";
import { AvatarsRepository } from "../../repositories/avatars-repository";
import { BasesRepository } from "../../repositories/bases-repository";
import { CompaniesRepository } from "../../repositories/companies-repository";
import { UsersRepository } from "../../repositories/users-repository";

interface EditUserUseCaseRequest {
  actualUserRole: string;
  userId: string;

  name?: string;
  email?: string;
  password?: string;

  role?: string;

  baseId?: string;
  companyId?: string;

  isActive?: boolean;

  avatarId?: string | null; //TODO: Implement avatar handling
}

type EditUserUseCaseResponse = Either<
  AlreadyRegisteredError | ResourceNotFoundError | NotAllowedError,
  {
    user: User;
  }
>;

@Injectable()
export class EditUserUseCase {
  constructor(
    private companiesRepository: CompaniesRepository,
    private basesRepository: BasesRepository,
    private usersRepository: UsersRepository,
    private avatarsRepository: AvatarsRepository,
    private hashGenerator: HashGenerator,
  ) {}

  async execute(
    editUserUseCaseBody: Readonly<EditUserUseCaseRequest>,
  ): Promise<EditUserUseCaseResponse> {
    let hasNewEntries = false;
    const {
      actualUserRole,
      userId,
      baseId,
      companyId,
      email,
      isActive,
      name,
      password,
      role,
    } = editUserUseCaseBody;

    try {
      if (this.noEntries(editUserUseCaseBody)) {
        return left(new NotAllowedError("No entries provided"));
      }

      const user = await this.usersRepository.findById(userId);
      if (!user) {
        return left(new ResourceNotFoundError("User not found"));
      }

      if (password) {
        const hashedPassword = await this.hashGenerator.hash(password);
        if (hashedPassword !== user.password) {
          user.password = hashedPassword;
          hasNewEntries = true;
        }
      }
      if (role && role !== user.role.value) {
        this.doesProvidedRolePassAllChecks(actualUserRole, role);
        user.role = UserRole.create(role);
        hasNewEntries = true;
      }
      if (email && email !== user.email) {
        await this.doesProvidedEmailPassAllChecks(email);
        user.email = email;
        hasNewEntries = true;
      }
      if (companyId && companyId !== user.companyId.toString()) {
        await this.doesProvidedCompanyIdPassAllChecks(companyId);
        user.companyId = new UniqueEntityID(companyId);
        hasNewEntries = true;
      }
      if (baseId && baseId !== user.baseId.toString()) {
        await this.doesProvidedBaseIdPassAllChecks(
          baseId,
          user.companyId.toString(),
          companyId,
        );
        user.baseId = new UniqueEntityID(baseId);
        hasNewEntries = true;
      }
      if (name && name !== user.name) {
        user.name = name;
        hasNewEntries = true;
      }
      if (isActive !== undefined && isActive !== user.isActive) {
        user.isActive = isActive;
        hasNewEntries = true;
      }

      if (hasNewEntries) {
        await this.usersRepository.save(user);
      }

      return right({
        user,
      });
    } catch (error) {
      if (
        error instanceof AlreadyRegisteredError ||
        error instanceof ResourceNotFoundError ||
        error instanceof NotAllowedError
      ) {
        return left(error);
      } else {
        throw new Error("An unexpected error occurred");
      }
    }
  }
  noEntries(entries: EditUserUseCaseRequest): boolean {
    return Object.entries(entries)
      .filter(([key]) => key !== "actualUserRole" && key !== "userId")
      .every(([, value]) => value === undefined);
  }
  doesProvidedRolePassAllChecks(
    actualUserRole: string,
    role: string,
  ): asserts role is UserRoleEntries {
    if (!UserRole.isValid(role)) {
      throw new NotAllowedError("The provided user role is invalid");
    }
    if (!UserRole.isValid(actualUserRole)) {
      throw new NotAllowedError("Invalid permission");
    }
    if (
      !UserRole.doesUserHavePermission(
        UserRole.create(actualUserRole),
        UserRole.create(role),
      )
    ) {
      throw new NotAllowedError("Invalid permission");
    }
  }
  async doesProvidedEmailPassAllChecks(email: string): Promise<void> {
    const userWithSameEmail = await this.usersRepository.findByEmail(email);
    if (userWithSameEmail) {
      throw new AlreadyRegisteredError("Email already registered");
    }
  }
  async doesProvidedAvatarPassAllChecks(avatarId: string): Promise<void> {
    const avatar = await this.avatarsRepository.findById(avatarId);
    if (!avatar) {
      throw new ResourceNotFoundError("Avatar not found");
    }
  }
  async doesProvidedCompanyIdPassAllChecks(companyId: string): Promise<void> {
    const company = await this.companiesRepository.findById(companyId);
    if (!company) {
      throw new ResourceNotFoundError("Company not found");
    }
  }
  async doesProvidedBaseIdPassAllChecks(
    baseId: string,
    userCompanyId: string,
    companyId?: string,
  ): Promise<void> {
    const base = await this.basesRepository.findById(baseId);
    if (!base) {
      throw new ResourceNotFoundError("Base not found");
    }
    if (companyId && base.companyId.toString() !== companyId) {
      throw new NotAllowedError("Base doesn't belong to the given company");
    }
    if (base.companyId.toString() !== userCompanyId) {
      throw new NotAllowedError(
        "Base doesn't belong to the given user company",
      );
    }
  }
}
