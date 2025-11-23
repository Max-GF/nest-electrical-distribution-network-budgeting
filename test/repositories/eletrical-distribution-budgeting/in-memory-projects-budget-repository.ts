import { ProjectsBudgetRepository } from "src/domain/eletrical-distribution-budgeting/application/repositories/projects-budget-repository";
import { Point } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { ProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";

export class InMemoryProjectsBudgetRepository
  implements ProjectsBudgetRepository
{
  public savedMaterials: ProjectMaterial[] = [];
  public savedPoints: Point[] = [];
  public savedProject: Project | null = null;

  async saveProjectBudgetMaterials(
    project: Project,
    points: Point[],
    materials: ProjectMaterial[],
  ): Promise<void> {
    this.savedProject = project;
    this.savedPoints.push(...points);
    this.savedMaterials.push(...materials);
  }
}
