import { Injectable } from "@nestjs/common";
import { UserRole } from "prisma/generated/client";
import { DomainEvents } from "src/core/events/domain-events";
import { PaginationParams } from "src/core/repositories/pagination-params";
import { UsersRepository } from "src/domain/user-management/application/repositories/users-repository";
import { FetchUsersWithFilteredOptionsUseCaseRequest } from "src/domain/user-management/application/use-cases/user/fetch-users-with-filtered-options";
import { User } from "src/domain/user-management/enterprise/entities/base-user";
import { UserWithDetails } from "src/domain/user-management/enterprise/entities/value-objects/user-with-details";
import { PrismaUserMapper } from "../../mappers/user-management/prisma-user-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMany(users: User[]): Promise<void> {
    const data = users.map(PrismaUserMapper.toPrisma);
    await this.prisma.user.createMany({ data });
    users.forEach((user) => {
      DomainEvents.dispatchEventsForAggregate(user.id);
    });
  }
  async save(user: User): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id.toString() },
      data: PrismaUserMapper.toPrisma(user),
    });
    DomainEvents.dispatchEventsForAggregate(user.id);
  }
  async findById(id: string): Promise<User | null> {
    const foundedUser = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!foundedUser) return null;
    return PrismaUserMapper.toDomain(foundedUser);
  }
  async findByCpf(cpf: string): Promise<User | null> {
    const foundedUser = await this.prisma.user.findUnique({
      where: { cpf },
    });
    if (!foundedUser) return null;
    return PrismaUserMapper.toDomain(foundedUser);
  }
  async findByEmail(email: string): Promise<User | null> {
    const foundedUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!foundedUser) return null;
    return PrismaUserMapper.toDomain(foundedUser);
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

    const users = await this.prisma.user.findMany({
      where: {
        ...(roles ? { role: { in: roles as UserRole[] } } : {}),
        ...(basesIds
          ? { baseId: { in: basesIds.map((id) => id.toString()) } }
          : {}),
        ...(companiesIds
          ? { companyId: { in: companiesIds.map((id) => id.toString()) } }
          : {}),
        ...(isActive !== undefined ? { isActive } : {}),
      },
      include: {
        company: true,
        base: true,
        avatar: true,
      },
      orderBy: {
        name: "asc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return users.map(PrismaUserMapper.toDomainWithDetails);
  }
}
