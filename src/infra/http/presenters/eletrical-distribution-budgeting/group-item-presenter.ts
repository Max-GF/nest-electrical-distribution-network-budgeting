import { GroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";

export class GroupItemPresenter {
  static toHttp(groupItem: GroupItem) {
    const base = {
      id: groupItem.id.toString(),
      groupId: groupItem.groupId.toString(),
      quantity: groupItem.quantity,
      addByPhase: groupItem.addByPhase,
      description: groupItem.description,
      type: groupItem.type,
    };

    if (groupItem.isMaterial()) {
      return {
        ...base,
        materialId: groupItem.materialId.toString(),
      };
    }

    if (groupItem.isPoleScrew()) {
      return {
        ...base,
        lengthAdd: groupItem.lengthAdd,
      };
    }

    if (groupItem.isCableConnector()) {
      return {
        ...base,
        localCableSectionInMM: groupItem.localCableSectionInMM,
        oneSideConnector: groupItem.oneSideConnector,
      };
    }

    return base;
  }
}
