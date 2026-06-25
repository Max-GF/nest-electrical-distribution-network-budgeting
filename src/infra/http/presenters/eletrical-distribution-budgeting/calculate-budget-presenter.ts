import { ProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";
import { ProjectMaterialWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/project-material-with-details";
import { ProjectMaterialDto } from "../../swagger/eletrical-distribution-budgeting/dto/budget/project-material.dto";
import { GroupPresenter } from "./group-presenter";
import { PointPresenter } from "./point-presenter";
import { ProjectPresenter } from "./project-presenter";

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
  static toHTTPWithDetails(projectMaterial: ProjectMaterialWithDetails) {
    return {
      id: projectMaterial.id.toString(),
      project: ProjectPresenter.toHttp(projectMaterial.project),
      point: projectMaterial.point
        ? PointPresenter.toHttp(projectMaterial.point)
        : undefined,
      itemType: projectMaterial.itemType,
      itemCode: projectMaterial.itemCode,
      itemDescription: projectMaterial.itemDescription,
      itemUnit: projectMaterial.itemUnit,
      quantity: projectMaterial.quantity,
      groupSpecs: projectMaterial.groupSpecs
        ? {
            group: GroupPresenter.toHttp(projectMaterial.groupSpecs.group),
            utilityPoleLevel: projectMaterial.groupSpecs.utilityPoleLevel,
            tensionLevel: projectMaterial.groupSpecs.tensionLevel,
          }
        : undefined,
    };
  }
}
