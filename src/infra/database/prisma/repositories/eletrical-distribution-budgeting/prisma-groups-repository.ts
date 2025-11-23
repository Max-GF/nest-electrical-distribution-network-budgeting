import { Injectable } from "@nestjs/common";
import { Prisma } from "prisma/generated/client";
import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchGroupsFilterOptions,
  GroupsRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/groups-repository";
import { GroupWithDetailedItems } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/fetch-groups-with-filter-options";
import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { PrismaGroupItemMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-group-item-mapper";
import { PrismaGroupMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-group-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaGroupsRepository implements GroupsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(groups: Group[]): Promise<void> {
    await this.prisma.group.createMany({
      data: groups.map(PrismaGroupMapper.toPrisma),
    });
  }

  async save(group: Group): Promise<void> {
    const data = PrismaGroupMapper.toPrisma(group);
    await this.prisma.group.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<Group | null> {
    const group = await this.prisma.group.findUnique({
      where: { id },
    });

    if (!group) {
      return null;
    }

    return PrismaGroupMapper.toDomain(group);
  }

  async findByIds(ids: string[]): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });

    return groups.map(PrismaGroupMapper.toDomain);
  }

  async findByName(name: string): Promise<Group | null> {
    const group = await this.prisma.group.findFirst({
      where: { name },
    });

    if (!group) {
      return null;
    }

    return PrismaGroupMapper.toDomain(group);
  }

  async findByNames(names: string[]): Promise<Group[]> {
    const groups = await this.prisma.group.findMany({
      where: {
        name: {
          in: names,
        },
      },
    });

    return groups.map(PrismaGroupMapper.toDomain);
  }

  async createGroupWithItems(group: Group, items: GroupItem[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.group.create({
        data: PrismaGroupMapper.toPrisma(group),
      });

      await tx.groupItem.createMany({
        data: items.map(PrismaGroupItemMapper.toPrisma),
      });
    });
  }

  async createBulkGroupsWithItems(
    groupsWithItems: { group: Group; items: GroupItem[] }[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (const { group, items } of groupsWithItems) {
        await tx.group.create({
          data: PrismaGroupMapper.toPrisma(group),
        });

        await tx.groupItem.createMany({
          data: items.map(PrismaGroupItemMapper.toPrisma),
        });
      }
    });
  }

  async updateGroupAndItems(
    group: Group,
    itemsToCreate: GroupItem[],
    itemsToEdit: GroupItem[],
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const groupData = PrismaGroupMapper.toPrisma(group);
      await tx.group.update({
        where: { id: groupData.id },
        data: groupData,
      });

      if (itemsToCreate.length > 0) {
        await tx.groupItem.createMany({
          data: itemsToCreate.map(PrismaGroupItemMapper.toPrisma),
        });
      }

      for (const item of itemsToEdit) {
        const itemData = PrismaGroupItemMapper.toPrisma(item);
        await tx.groupItem.update({
          where: { id: itemData.id },
          data: itemData,
        });
      }
    });
  }

  async fetchWithFilter(
    filterOptions: FetchGroupsFilterOptions,
    paginationParams: PaginationParams,
  ): Promise<{
    groups: Group[];
    pagination: PaginationResponseParams;
  }> {
    const where: Prisma.GroupWhereInput = {};

    if (filterOptions.name) {
      where.name = { contains: filterOptions.name, mode: "insensitive" };
    }
    if (filterOptions.description) {
      where.description = {
        contains: filterOptions.description,
        mode: "insensitive",
      };
    }
    if (filterOptions.tension) {
      where.tension = filterOptions.tension;
    }

    const [count, groups] = await Promise.all([
      this.prisma.group.count({ where }),
      this.prisma.group.findMany({
        where,
        take: paginationParams.pageSize,
        skip: (paginationParams.page - 1) * paginationParams.pageSize,
      }),
    ]);

    return {
      groups: groups.map(PrismaGroupMapper.toDomain),
      pagination: {
        actualPage: paginationParams.page,
        actualPageSize: groups.length,
        lastPage: Math.ceil(count / paginationParams.pageSize),
      },
    };
  }

  async fetchGroupWithDetailedItems(
    filter: FetchGroupsFilterOptions,
    pagination: PaginationParams,
  ): Promise<{
    groupWithDetailedItems: GroupWithDetailedItems[];
    pagination: PaginationResponseParams;
  }> {
    const where: Prisma.GroupWhereInput = {};

    if (filter.name) {
      where.name = { contains: filter.name, mode: "insensitive" };
    }
    if (filter.description) {
      where.description = {
        contains: filter.description,
        mode: "insensitive",
      };
    }
    if (filter.tension) {
      where.tension = filter.tension;
    }

    const [count, groups] = await Promise.all([
      this.prisma.group.count({ where }),
      this.prisma.group.findMany({
        where,
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
        include: {
          items: {
            include: {
              material: true,
            },
          },
        },
      }),
    ]);

    const groupWithDetailedItems: GroupWithDetailedItems[] = groups.map(
      (groupRaw) => {
        const group = PrismaGroupMapper.toDomain(groupRaw);

        const itemsWithDetails = groupRaw.items.map((itemRaw) => {
          return PrismaGroupItemMapper.toDomainWithDetails(itemRaw);
        });

        return {
          group,
          itemsWithDetails,
        };
      },
    );

    return {
      groupWithDetailedItems,
      pagination: {
        actualPage: pagination.page,
        actualPageSize: groupWithDetailedItems.length,
        lastPage: Math.ceil(count / pagination.pageSize),
      },
    };
  }
}
