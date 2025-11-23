import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import { Group } from "../../enterprise/entities/group";
import { GroupItem } from "../../enterprise/entities/group-item";
import { TensionLevelEntries } from "../../enterprise/entities/value-objects/tension-level";
import { GroupWithDetailedItems } from "../use-cases/group/fetch-groups-with-filter-options";

export interface FetchGroupsFilterOptions {
  name?: string;
  tension?: TensionLevelEntries;
  description?: string;
}

export abstract class GroupsRepository {
  abstract createMany(groups: Group[]): Promise<void>;
  abstract findById(id: string): Promise<Group | null>;
  abstract findByIds(ids: string[]): Promise<Group[]>;
  abstract findByName(name: string): Promise<Group | null>;
  abstract findByNames(names: string[]): Promise<Group[]>;
  abstract createGroupWithItems(
    group: Group,
    items: GroupItem[],
  ): Promise<void>;
  abstract createBulkGroupsWithItems(
    groupsWithItems: { group: Group; items: GroupItem[] }[],
  ): Promise<void>;
  abstract updateGroupAndItems(
    group: Group,
    itemsToCreate: GroupItem[],
    itemsToEdit: GroupItem[],
  ): Promise<void>;

  abstract fetchGroupWithDetailedItems(
    filter: FetchGroupsFilterOptions,
    pagination: PaginationParams,
  ): Promise<{
    groupWithDetailedItems: GroupWithDetailedItems[];
    pagination: PaginationResponseParams;
  }>;
}
