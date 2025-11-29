import { ProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";
import { ProjectMaterialDto } from "../../swagger/eletrical-distribution-budgeting/dto/budget/project-material.dto";

export class CalculateBudgetPresenter {
  static toHTTP(projectMaterial: ProjectMaterial): ProjectMaterialDto {
    return {
      id: projectMaterial.id.toString(),
      projectId: projectMaterial.projectId.toString(),
      itemId: projectMaterial.itemId.toString(),
      itemType: projectMaterial.itemType,
      quantity: projectMaterial.quantity,
      pointId: projectMaterial.pointId?.toString(),
      groupSpecs: projectMaterial.groupSpecs
        ? {
            groupId: projectMaterial.groupSpecs.groupId.toString(),
            utilityPoleLevel: projectMaterial.groupSpecs.utilityPoleLevel,
            tensionLevel: projectMaterial.groupSpecs.tensionLevel,
          }
        : undefined,
    };
  }
}
