import { GroupItem } from "../../enterprise/entities/group-item";
import { GroupItemWithDetails } from "../../enterprise/entities/value-objects/group-item-with-details";
import { TensionLevelEntries } from "../../enterprise/entities/value-objects/tension-level";

export interface FetchGroupItemsFilterOptions {
  codes?: number[];
  description?: string;
  tension?: TensionLevelEntries;
}

export abstract class GroupItemsRepository {
  abstract createMany(groupitems: GroupItem[]): Promise<void>;
  abstract updateMany(groupitems: GroupItem[]): Promise<void>;
  abstract findById(id: string): Promise<GroupItem | null>;
  abstract findByGroupId(groupId: string): Promise<GroupItem[]>;
  abstract findByManyGroupsIds(groupsIds: string[]): Promise<GroupItem[]>;
  abstract findByGroupIdWithDetails(
    groupId: string,
  ): Promise<GroupItemWithDetails[]>;
  abstract findByManyGroupsIdsWithDetails(
    groupsIds: string[],
  ): Promise<GroupItemWithDetails[]>;
}
