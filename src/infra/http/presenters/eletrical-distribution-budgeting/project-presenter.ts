import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";

export class ProjectPresenter {
  static toHttp(project: Project) {
    return {
      id: project.id.toString(),
      name: project.name,
      description: project.description,
      budgetAlreadyCalculated: project.budgetAlreadyCalculated,
      lastBudgetCalculatedAt: project.lastBudgetCalculatedAt,
    };
  }
}
