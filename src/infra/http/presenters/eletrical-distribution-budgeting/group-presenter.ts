import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { GroupItemWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/group-item-with-details";
import { MaterialPresenter } from "./material-presenter";

export class GroupPresenter {
  static toHttp(group: Group) {
    return {
      id: group.id.toString(),
      name: group.name,
      description: group.description,
      tension: group.tension.value,
    };
  }

  static toHttpItem(item: GroupItemWithDetails) {
    const base = {
      groupItemId: item.groupItemId.toString(),
      groupId: item.groupId.toString(),
      quantity: item.quantity,
      addByPhase: item.addByPhase,
      description: item.description,
      type: item.type,
    };

    if (item.isMaterial()) {
      return {
        ...base,
        type: "material",
        material: MaterialPresenter.toHttp(item.material),
      };
    } else if (item.isPoleScrew()) {
      return {
        ...base,
        type: "poleScrew",
        lengthAdd: item.lengthAdd,
      };
    } else if (item.isCableConnector()) {
      return {
        ...base,
        type: "cableConnector",
        localCableSectionInMM: item.localCableSectionInMM,
        oneSideConnector: item.oneSideConnector,
      };
    }
  }

  static toHttpWithItems(group: Group, items: GroupItemWithDetails[]) {
    return {
      group: GroupPresenter.toHttp(group),
      items: items.map(GroupPresenter.toHttpItem),
    };
  }
}
