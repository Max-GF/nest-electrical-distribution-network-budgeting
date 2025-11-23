import { Cable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";

export class CablePresenter {
  static toHttp(cable: Cable) {
    return {
      id: cable.id.toString(),
      code: cable.code,
      description: cable.description,
      unit: cable.unit,
      tension: cable.tension.value,
      sectionAreaInMM: cable.sectionAreaInMM,
    };
  }
}
