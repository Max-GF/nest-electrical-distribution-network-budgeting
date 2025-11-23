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
import { InMemoryGroupItemsRepository } from "./in-memory-group-items-repository";

export class InMemoryGroupsRepository implements GroupsRepository {
  public items: Group[] = [];
  constructor(private groupItemsRepository: InMemoryGroupItemsRepository) {}

  async createMany(groups: Group[]): Promise<void> {
    this.items.push(...groups);
  }
  async createGroupWithItems(group: Group, items: GroupItem[]): Promise<void> {
    this.items.push(group);
    await this.groupItemsRepository.createMany(items);
  }
  async updateGroupAndItems(
    group: Group,
    itemsToCreate: GroupItem[],
    itemsToEdit: GroupItem[],
  ): Promise<void> {
    const groupIndex = this.items.findIndex((item) => item.id === group.id);

    if (groupIndex >= 0) {
      this.items[groupIndex] = group;
      await this.groupItemsRepository.createMany(itemsToCreate);
      await this.groupItemsRepository.updateMany(itemsToEdit);
    }
  }
  async findById(id: string): Promise<Group | null> {
    const foundedGroup = this.items.find(
      (item) => item.id.toString() === id.toString(),
    );
    return foundedGroup ?? null;
  }
  async findByIds(ids: string[]): Promise<Group[]> {
    const foundedGroups = this.items.filter((item) =>
      ids.includes(item.id.toString()),
    );
    return foundedGroups;
  }
  async findByName(name: string): Promise<Group | null> {
    const foundedGroup = this.items.find((item) => item.name === name);
    return foundedGroup ?? null;
  }
  async findByNames(names: string[]): Promise<Group[]> {
    return this.items.filter((item) => names.includes(item.name));
  }
  async createBulkGroupsWithItems(
    groupsWithItems: { group: Group; items: GroupItem[] }[],
  ): Promise<void> {
    const { groups, items } = groupsWithItems.reduce(
      (acc, groupWithItems) => {
        acc.groups.push(groupWithItems.group);
        acc.items.push(...groupWithItems.items);
        return acc;
      },
      { groups: [] as Group[], items: [] as GroupItem[] },
    );
    this.items.push(...groups);
    await this.groupItemsRepository.createMany(items);
  }
  async fetchGroupWithDetailedItems(
    filter: FetchGroupsFilterOptions,
    pagination: PaginationParams,
  ): Promise<{
    groupWithDetailedItems: GroupWithDetailedItems[];
    pagination: PaginationResponseParams;
  }> {
    const { name, description, tension } = filter;
    const { page, pageSize } = pagination;

    const filteredGroups = this.items.filter((group) => {
      if (
        (name && !group.name.toLowerCase().includes(name.toLowerCase())) ||
        (description &&
          (!group.description ||
            !group.description
              .toLowerCase()
              .includes(description.toLowerCase()))) ||
        (tension && group.tension.value !== tension)
      ) {
        return false;
      }
      return true;
    });

    const paginatedGroups = filteredGroups.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );
    const groupsItems =
      await this.groupItemsRepository.findByManyGroupsIdsWithDetails(
        paginatedGroups.map((group) => group.id.toString()),
      );

    const groupWithDetailedItems = paginatedGroups.map((group) => {
      const detailedItems = groupsItems.filter(
        (item) => item.groupId.toString() === group.id.toString(),
      );
      return {
        group,
        itemsWithDetails: detailedItems,
      };
    });

    return {
      groupWithDetailedItems,
      pagination: {
        actualPage: page,
        actualPageSize: groupWithDetailedItems.length,
        lastPage: Math.ceil(filteredGroups.length / pageSize),
      },
    };
  }
}
