import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import {
  FetchProjectsFilterOptions,
  ProjectsRepository,
} from "src/domain/eletrical-distribution-budgeting/application/repositories/projects-repository";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";

export class InMemoryProjectsRepository implements ProjectsRepository {
  public items: Project[] = [];
  async createMany(projects: Project[]): Promise<void> {
    this.items.push(...projects);
  }
  async save(project: Project): Promise<void> {
    const index = this.items.findIndex((item) => item.id === project.id);
    if (index !== -1) {
      this.items[index] = project;
    } else {
      this.items.push(project);
    }
  }
  async findById(id: string): Promise<Project | null> {
    return this.items.find((item) => item.id.toString() === id) || null;
  }
  async findByIds(ids: string[]): Promise<Project[]> {
    return this.items.filter((item) => ids.includes(item.id.toString()));
  }
  async findByName(name: string): Promise<Project | null> {
    return this.items.find((item) => item.name === name) || null;
  }
  async fetchWithFilterOptions(
    filter: FetchProjectsFilterOptions,
    pagination: PaginationParams,
  ): Promise<{ projects: Project[]; pagination: PaginationResponseParams }> {
    const {
      name,
      description,
      budgetAlreadyCalculated,
      calculatedDateOptions,
    } = filter;
    const { page, pageSize } = pagination;
    const { after, before } = calculatedDateOptions || {};

    const foundedProjects = this.items.filter((item) => {
      if (
        (name && !item.name.toLowerCase().includes(name.toLowerCase())) ||
        (description &&
          !item.description
            .toLowerCase()
            .includes(description.toLowerCase())) ||
        (budgetAlreadyCalculated !== undefined &&
          item.budgetAlreadyCalculated !== budgetAlreadyCalculated) ||
        (after &&
          item.lastBudgetCalculatedAt &&
          item.lastBudgetCalculatedAt.getTime() < after.getTime()) ||
        (before &&
          item.lastBudgetCalculatedAt &&
          item.lastBudgetCalculatedAt.getTime() > before.getTime())
      ) {
        return false;
      }
      return true;
    });
    const paginatedProjects = foundedProjects.slice(
      (page - 1) * pageSize,
      page * pageSize,
    );

    return {
      projects: paginatedProjects,
      pagination: {
        actualPage: page,
        actualPageSize: paginatedProjects.length,
        lastPage: Math.ceil(foundedProjects.length / pageSize),
      },
    };
  }
}
