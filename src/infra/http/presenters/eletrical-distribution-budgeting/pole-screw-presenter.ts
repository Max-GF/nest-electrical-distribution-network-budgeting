import { PoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";

export class PoleScrewPresenter {
  static toHttp(poleScrew: PoleScrew) {
    return {
      id: poleScrew.id.toString(),
      code: poleScrew.code,
      description: poleScrew.description,
      unit: poleScrew.unit,
      lengthInMM: poleScrew.lengthInMM,
    };
  }
}
