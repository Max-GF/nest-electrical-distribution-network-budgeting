import { Injectable } from "@nestjs/common";
import { GroupItemsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/group-items-repository";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { GroupItemWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/group-item-with-details";
import { PrismaGroupItemMapper } from "../../mappers/eletrical-distribution-budgeting/prisma-group-item-mapper";
import { PrismaService } from "../../prisma.service";

@Injectable()
export class PrismaGroupItemsRepository implements GroupItemsRepository {
  constructor(private prisma: PrismaService) {}

  async createMany(groupItems: GroupItem[]): Promise<void> {
    await this.prisma.groupItem.createMany({
      data: groupItems.map(PrismaGroupItemMapper.toPrisma),
    });
  }

  async updateMany(groupItems: GroupItem[]): Promise<void> {
    await this.prisma.$transaction(
      groupItems.map((item) => {
        const data = PrismaGroupItemMapper.toPrisma(item);
        return this.prisma.groupItem.update({
          where: { id: data.id },
          data,
        });
      }),
    );
  }

  async save(groupItem: GroupItem): Promise<void> {
    const data = PrismaGroupItemMapper.toPrisma(groupItem);
    await this.prisma.groupItem.update({
      where: { id: data.id },
      data,
    });
  }

  async findById(id: string): Promise<GroupItem | null> {
    const groupItem = await this.prisma.groupItem.findUnique({
      where: { id },
    });

    if (!groupItem) {
      return null;
    }

    return PrismaGroupItemMapper.toDomain(groupItem);
  }

  async findByGroupId(groupId: string): Promise<GroupItem[]> {
    const groupItems = await this.prisma.groupItem.findMany({
      where: { groupId },
    });

    return groupItems.map(PrismaGroupItemMapper.toDomain);
  }

  async findByManyGroupsIds(groupsIds: string[]): Promise<GroupItem[]> {
    const groupItems = await this.prisma.groupItem.findMany({
      where: {
        groupId: {
          in: groupsIds,
        },
      },
    });

    return groupItems.map(PrismaGroupItemMapper.toDomain);
  }

  async findByGroupIdWithDetails(
    groupId: string,
  ): Promise<GroupItemWithDetails[]> {
    const groupItems = await this.prisma.groupItem.findMany({
      where: { groupId },
      include: {
        material: true,
      },
    });

    return groupItems.map((itemRaw) => {
      return PrismaGroupItemMapper.toDomainWithDetails(itemRaw);
    });
  }

  async findByManyGroupsIdsWithDetails(
    groupsIds: string[],
  ): Promise<GroupItemWithDetails[]> {
    const groupItems = await this.prisma.groupItem.findMany({
      where: {
        groupId: {
          in: groupsIds,
        },
      },
      include: {
        material: true,
      },
    });

    return groupItems.map((itemRaw) => {
      return PrismaGroupItemMapper.toDomainWithDetails(itemRaw);
    });
  }

  async delete(groupItem: GroupItem): Promise<void> {
    await this.prisma.groupItem.delete({
      where: { id: groupItem.id.toString() },
    });
  }

  async deleteMany(groupItems: GroupItem[]): Promise<void> {
    await this.prisma.groupItem.deleteMany({
      where: {
        id: {
          in: groupItems.map((item) => item.id.toString()),
        },
      },
    });
  }
}
