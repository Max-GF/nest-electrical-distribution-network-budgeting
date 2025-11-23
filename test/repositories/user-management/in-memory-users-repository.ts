import { DomainEvents } from "src/core/events/domain-events";
import { PaginationParams } from "src/core/repositories/pagination-params";
import { UsersRepository } from "src/domain/user-management/application/repositories/users-repository";
import { FetchUsersWithFilteredOptionsUseCaseRequest } from "src/domain/user-management/application/use-cases/user/fetch-users-with-filtered-options";
import { User } from "src/domain/user-management/enterprise/entities/base-user";
import { UserAvatar } from "src/domain/user-management/enterprise/entities/user-avatar";
import { UserWithDetails } from "src/domain/user-management/enterprise/entities/value-objects/user-with-details";
import { InMemoryAvatarsRepository } from "./in-memory-avatars-repository";
import { InMemoryBasesRepository } from "./in-memory-bases-repository";
import { InMemoryCompaniesRepository } from "./in-memory-companies-repository";

export class InMemoryUsersRepository implements UsersRepository {
  public items: User[] = [];
  constructor(
    private readonly companiesRepository: InMemoryCompaniesRepository,
    private readonly basesRepository: InMemoryBasesRepository,
    private readonly avatarsRepository: InMemoryAvatarsRepository,
  ) {}
  async createMany(users: User[]): Promise<void> {
    this.items.push(...users);
    users.forEach((user) => {
      DomainEvents.dispatchEventsForAggregate(user.id);
    });
  }
  async save(user: User): Promise<void> {
    const userToSaveIndex = this.items.findIndex(
      (item) => item.id.toString() === user.id.toString(),
    );
    if (userToSaveIndex >= 0) {
      this.items[userToSaveIndex] = user;
    }
    DomainEvents.dispatchEventsForAggregate(user.id);
  }
  async findById(id: string): Promise<User | null> {
    const user = this.items.find((item) => item.id.toString() === id);
    if (!user) {
      return null;
    }
    return user;
  }
  async findByCpf(cpf: string): Promise<User | null> {
    const user = this.items.find((item) => item.cpf.value === cpf);
    if (!user) {
      return null;
    }
    return user;
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = this.items.find((item) => item.email === email);
    if (!user) {
      return null;
    }
    return user;
  }

  async fetchWithFilteredOptions(
    options: Omit<
      FetchUsersWithFilteredOptionsUseCaseRequest,
      "page" | "pageSize"
    >,
    paginationParams: PaginationParams,
  ): Promise<UserWithDetails[]> {
    const { roles, basesIds, companiesIds, isActive } = options;
    const { page, pageSize } = paginationParams;

    const foundedUsers = this.items
      .filter((user) => {
        if (roles && !roles.includes(user.role.value)) {
          return false;
        }
        if (basesIds && !basesIds.includes(user.baseId.toString())) {
          return false;
        }
        if (companiesIds && !companiesIds.includes(user.companyId.toString())) {
          return false;
        }
        if (isActive !== undefined && user.isActive !== isActive) {
          return false;
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice((page - 1) * pageSize, page * pageSize);

    return foundedUsers.map((user) => {
      let avatar: UserAvatar | undefined;
      const company = this.companiesRepository.items.find(
        (company) => company.id.toString() === user.companyId.toString(),
      );
      const base = this.basesRepository.items.find(
        (base) => base.id.toString() === user.baseId.toString(),
      );
      if (!company || !base) {
        throw new Error("Company or Base not found");
      }
      if (user.avatarId !== null && user.avatarId !== undefined) {
        avatar = this.avatarsRepository.items.find(
          (avatar) => avatar.id.toString() === user.avatarId?.toString(),
        );
        if (!avatar) {
          throw new Error("Avatar not found");
        }
      }

      return UserWithDetails.create({
        id: user.id.toString(),
        cpf: user.cpf.value,
        name: user.name,
        email: user.email,
        role: user.role.value,
        base: base,
        company: company,
        isActive: user.isActive,
        firstLogin: user.firstLogin,
        avatar,
      });
    });
  }
}
