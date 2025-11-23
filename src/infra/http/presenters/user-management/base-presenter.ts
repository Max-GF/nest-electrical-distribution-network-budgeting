import { Base } from "src/domain/user-management/enterprise/entities/base";

export class BasePresenter {
  static toHttp(base: Base) {
    return {
      id: base.id.toString(),
      name: base.name,
      companyId: base.companyId.toString(),
    };
  }
}
