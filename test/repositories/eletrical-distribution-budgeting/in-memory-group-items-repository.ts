import { GroupItemsRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/group-items-repository";
import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { GroupItemWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/group-item-with-details";
import { InMemoryCablesRepository } from "./in-memory-cables-repository";
import { InMemoryMaterialsRepository } from "./in-memory-materials-repository";

export class InMemoryGroupItemsRepository implements GroupItemsRepository {
  public items: GroupItem[] = [];
  constructor(
    private materialsRepository: InMemoryMaterialsRepository,
    private cablesRepository: InMemoryCablesRepository,
  ) {}

  async createMany(groupitems: GroupItem[]): Promise<void> {
    this.items.push(...groupitems);
  }
  async updateMany(groupitems: GroupItem[]): Promise<void> {
    groupitems.forEach((groupitem) => {
      const index = this.items.findIndex(
        (item) => item.id.toString() === groupitem.id.toString(),
      );
      if (index >= 0) {
        this.items[index] = groupitem;
      }
    });
  }
  async findById(id: string): Promise<GroupItem | null> {
    const foundGroupItem = this.items.find(
      (item) => item.id.toString() === id.toString(),
    );
    return foundGroupItem ?? null;
  }
  async findByGroupId(groupId: string): Promise<GroupItem[]> {
    return this.items.filter(
      (item) => item.groupId.toString() === groupId.toString(),
    );
  }
  async findByGroupIdWithDetails(
    groupId: string,
  ): Promise<GroupItemWithDetails[]> {
    const groupItems = this.items.filter(
      (item) => item.groupId.toString() === groupId.toString(),
    );
    const groupMaterials = await this.materialsRepository.findByIds(
      groupItems.map((item) => item.id.toString()),
    );
    const materialsMap = new Map<string, Material>(
      groupMaterials.map((material) => [material.id.toString(), material]),
    );
    const groupCables = await this.cablesRepository.findByIds(
      groupItems.map((item) => item.id.toString()),
    );
    const cablesMap = new Map<string, Cable>(
      groupCables.map((cable) => [cable.id.toString(), cable]),
    );

    const groupItemsWithDetails = groupItems
      .map((item) => {
        if (item.isMaterial()) {
          const material = materialsMap.get(item.id.toString());
          if (!material) {
            throw new Error(
              `Material with ID ${item.id.toString()} not found for GroupItem ${item.id.toString()}`,
            );
          }
          return GroupItemWithDetails.createMaterial({
            addByPhase: item.addByPhase,
            groupId: item.groupId,
            quantity: item.quantity,
            type: item.type,
            description: item.description,
            material: material,
            groupItemId: item.id,
          });
        }
        if (item.isPoleScrew()) {
          if (!item.lengthAdd) {
            throw new Error(
              `lengthAdd is required for PoleScrew GroupItem ${item.id.toString()}`,
            );
          }
          return GroupItemWithDetails.createPoleScrew({
            addByPhase: item.addByPhase,
            groupId: item.groupId,
            quantity: item.quantity,
            type: item.type,
            description: item.description,
            groupItemId: item.id,
            lengthAdd: item.lengthAdd,
          });
        }
        if (item.isCableConnector()) {
          const cable = item.localCableId
            ? cablesMap.get(item.localCableId.toString())
            : null; // Handle the case where localCableId is undefined
          if (cable === undefined) {
            throw new Error(
              `Cable with ID ${item.localCableId?.toString()} not found for GroupItem ${item.id.toString()}`,
            );
          }
          return GroupItemWithDetails.createCableConnector({
            addByPhase: item.addByPhase,
            groupId: item.groupId,
            quantity: item.quantity,
            type: item.type,
            description: item.description,
            groupItemId: item.id,
            localCable: cable ?? undefined,
            oneSideConnector: item.oneSideConnector,
          });
        }
        return null;
      })
      .filter((item) => item !== null);

    return groupItemsWithDetails;
  }
  async findByManyGroupsIdsWithDetails(
    groupsIds: string[],
  ): Promise<GroupItemWithDetails[]> {
    const groupsItems = this.items.filter((item) =>
      groupsIds.includes(item.groupId.toString()),
    );
    const groupMaterials = await this.materialsRepository.findByIds(
      groupsItems
        .filter((item) => item.isMaterial())
        .map((item) => item.materialId.toString()),
    );
    const materialsMap = new Map<string, Material>(
      groupMaterials.map((material) => [material.id.toString(), material]),
    );

    const groupCables = await this.cablesRepository.findByIds(
      groupsItems.reduce((acc: string[], item) => {
        if (item.isCableConnector() && item.localCableId) {
          acc.push(item.localCableId.toString());
        }
        return acc;
      }, []),
    );
    const cablesMap = new Map<string, Cable>(
      groupCables.map((cable) => [cable.id.toString(), cable]),
    );

    const groupItemsWithDetails = groupsItems
      .map((item) => {
        if (item.isMaterial()) {
          const material = materialsMap.get(item.materialId.toString());
          if (!material) {
            throw new Error(
              `Material with ID ${item.id.toString()} not found for GroupItem ${item.id.toString()}`,
            );
          }
          return GroupItemWithDetails.createMaterial({
            addByPhase: item.addByPhase,
            groupId: item.groupId,
            quantity: item.quantity,
            type: item.type,
            description: item.description,
            material: material,
            groupItemId: item.id,
          });
        }
        if (item.isPoleScrew()) {
          if (!item.lengthAdd) {
            throw new Error(
              `lengthAdd is required for PoleScrew GroupItem ${item.id.toString()}`,
            );
          }
          return GroupItemWithDetails.createPoleScrew({
            addByPhase: item.addByPhase,
            groupId: item.groupId,
            quantity: item.quantity,
            type: item.type,
            description: item.description,
            groupItemId: item.id,
            lengthAdd: item.lengthAdd,
          });
        }
        if (item.isCableConnector()) {
          const cable = item.localCableId
            ? cablesMap.get(item.localCableId.toString())
            : null;
          if (cable === undefined) {
            throw new Error(
              `Cable with ID ${item.localCableId?.toString()} not found for GroupItem ${item.id.toString()}`,
            );
          }
          return GroupItemWithDetails.createCableConnector({
            addByPhase: item.addByPhase,
            groupId: item.groupId,
            quantity: item.quantity,
            type: item.type,
            description: item.description,
            groupItemId: item.id,
            localCable: cable ?? undefined,
            oneSideConnector: item.oneSideConnector,
          });
        }
        return null;
      })
      .filter((item) => item !== null);

    return groupItemsWithDetails;
  }
  async findByManyGroupsIds(groupsIds: string[]): Promise<GroupItem[]> {
    const foundedGroupItems = this.items.filter((item) =>
      groupsIds.includes(item.groupId.toString()),
    );
    return foundedGroupItems;
  }
  async removeByIdsAndGroupId(options: {
    groupId: string;
    ids: string[];
  }): Promise<void> {
    const { groupId, ids } = options;
    const idsSet = new Set(ids);
    this.items = this.items.filter(
      (item) =>
        !(
          item.groupId.toString() === groupId && idsSet.has(item.id.toString())
        ),
    );
  }
}
