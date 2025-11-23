import {
  PaginationParams,
  PaginationResponseParams,
} from "src/core/repositories/pagination-params";
import { Project } from "../../enterprise/entities/project";

export interface FetchProjectsFilterOptions {
  name?: string;
  description?: string;
  budgetAlreadyCalculated?: boolean;
  calculatedDateOptions?: {
    before?: Date;
    after?: Date;
  };
}

export abstract class ProjectsRepository {
  abstract createMany(projects: Project[]): Promise<void>;
  abstract save(project: Project): Promise<void>;
  abstract findById(id: string): Promise<Project | null>;
  abstract findByIds(ids: string[]): Promise<Project[]>;
  abstract findByName(name: string): Promise<Project | null>;
  abstract fetchWithFilterOptions(
    filter: FetchProjectsFilterOptions,
    pagination: PaginationParams,
  ): Promise<{ projects: Project[]; pagination: PaginationResponseParams }>;
}
