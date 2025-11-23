import { Group } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";

export class GroupPresenter {
  static toHttp(group: Group) {
    return {
      id: group.id.toString(),
      name: group.name,
      description: group.description,
      tension: group.tension.value,
    };
  }
}
