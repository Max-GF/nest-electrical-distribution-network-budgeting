import { PaginationParams } from "src/core/repositories/pagination-params";
import { User } from "../../enterprise/entities/base-user";
import { UserWithDetails } from "../../enterprise/entities/value-objects/user-with-details";
import { FetchUsersWithFilteredOptionsUseCaseRequest } from "../use-cases/user/fetch-users-with-filtered-options";

export abstract class UsersRepository {
  abstract createMany(users: User[]): Promise<void>;
  abstract save(user: User): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByCpf(cpf: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract fetchWithFilteredOptions(
    options: Omit<
      FetchUsersWithFilteredOptionsUseCaseRequest,
      "page" | "pageSize"
    >,
    paginationParams: PaginationParams,
  ): Promise<UserWithDetails[]>;
}
