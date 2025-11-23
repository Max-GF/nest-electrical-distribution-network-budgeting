import { Point } from "../../enterprise/entities/point";
import { Project } from "../../enterprise/entities/project";
import { ProjectMaterial } from "../../enterprise/entities/project-material";

export abstract class ProjectsBudgetRepository {
  abstract saveProjectBudgetMaterials(
    project: Project,
    pointsToSave: Point[],
    projectMaterials: ProjectMaterial[],
  ): Promise<void>;
}
