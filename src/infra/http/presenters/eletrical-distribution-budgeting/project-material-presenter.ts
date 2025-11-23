import { ProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";

export class ProjectMaterialPresenter {
  static toHttp(projectMaterial: ProjectMaterial) {
    return {
      id: projectMaterial.id.toString(),
      projectId: projectMaterial.projectId.toString(),
      itemId: projectMaterial.itemId.toString(),
      itemType: projectMaterial.itemType,
      quantity: projectMaterial.quantity,
      pointId: projectMaterial.pointId?.toString() ?? null,
      groupSpecs: projectMaterial.groupSpecs
        ? {
            groupId: projectMaterial.groupSpecs.groupId.toString(),
            utilityPoleLevel: projectMaterial.groupSpecs.utilityPoleLevel,
            tensionLevel: projectMaterial.groupSpecs.tensionLevel,
          }
        : null,
    };
  }
}
