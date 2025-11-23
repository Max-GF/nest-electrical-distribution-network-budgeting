import { Material } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";

export class MaterialPresenter {
  static toHttp(material: Material) {
    return {
      id: material.id.toString(),
      code: material.code,
      description: material.description,
      unit: material.unit,
      tension: material.tension.value,
    };
  }
}
