import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import {
    UserRole,
    UserRoleEntries,
} from "../../../enterprise/entities/value-objects/user-roles";
import { UserWithDetails } from "../../../enterprise/entities/value-objects/user-with-details";
import { UsersRepository } from "../../repositories/users-repository";

export interface FetchUsersWithFilteredOptionsUseCaseRequest {
  roles?: string[];
  basesIds?: string[];
  companiesIds?: string[];
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}

type FetchUsersWithFilteredOptionsUseCaseResponse = Either<
  NotAllowedError,
  {
    users: UserWithDetails[];
  }
>;

@Injectable()
export class FetchUsersWithFilteredOptionsUseCase {
  constructor(private usersRepository: UsersRepository) {}

  async execute({
    roles,
    basesIds,
    companiesIds,
    isActive,
    page,
    pageSize,
  }: FetchUsersWithFilteredOptionsUseCaseRequest): Promise<FetchUsersWithFilteredOptionsUseCaseResponse> {
    if (page && page < 1) {
      return left(new NotAllowedError("Page must be greater than 0."));
    }
    if (pageSize && pageSize < 1) {
      return left(new NotAllowedError("pageSize must be greater than 0."));
    }
    try {
      this.doesAllGivenRolesAreValid(roles);
    } catch (error) {
      if (error instanceof NotAllowedError) {
        return left(error);
      } else {
        throw new Error("Unexpected error: " + error);
      }
    }
    const users = await this.usersRepository.fetchWithFilteredOptions(
      { basesIds, companiesIds, roles, isActive },
      {
        page: page ?? 1,
        pageSize: pageSize ?? 40,
      },
    );

    return right({
      users,
    });
  }

  doesAllGivenRolesAreValid(
    roles?: string[],
  ): asserts roles is UserRoleEntries[] {
    if (!roles) {
      return;
    }
    const invalidRoles = roles.filter((role) => {
      return !UserRole.isValid(role);
    });
    if (invalidRoles.length > 0) {
      throw new NotAllowedError(`Invalid roles: ${invalidRoles.join(", ")}.`);
    }
  }
}
