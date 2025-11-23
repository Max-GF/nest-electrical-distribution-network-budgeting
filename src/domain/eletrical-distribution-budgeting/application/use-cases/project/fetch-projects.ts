import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { PaginationResponseParams } from "src/core/repositories/pagination-params";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { ProjectsRepository } from "../../repositories/projects-repository";

export interface FetchProjectsUseCaseRequest {
  name?: string;
  description?: string;
  budgetAlreadyCalculated?: boolean;
  calculatedDateOptions?: {
    before?: Date;
    after?: Date;
  };
  page?: number;
  pageSize?: number;
}

type FetchProjectsUseCaseResponse = Either<
  NotAllowedError,
  {
    projects: Project[];
    pagination: PaginationResponseParams;
  }
>;

@Injectable()
export class FetchProjectsUseCase {
  constructor(private projectsRepository: ProjectsRepository) {}

  async execute({
    name,
    budgetAlreadyCalculated,
    description,
    calculatedDateOptions,
    page,
    pageSize,
  }: FetchProjectsUseCaseRequest): Promise<FetchProjectsUseCaseResponse> {
    if (page !== undefined && page <= 0) {
      return left(new NotAllowedError("Page must be greater than 0."));
    }
    if (pageSize !== undefined && pageSize <= 0) {
      return left(new NotAllowedError("Page size must be greater than 0."));
    }

    if (calculatedDateOptions) {
      const { before, after } = calculatedDateOptions;
      if (before && after && before < after) {
        return left(
          new NotAllowedError(
            "Invalid date range, before date must be before after date.",
          ),
        );
      }
    }

    const { projects, pagination } =
      await this.projectsRepository.fetchWithFilterOptions(
        {
          name,
          description,
          budgetAlreadyCalculated,
          calculatedDateOptions,
        },
        {
          page: page ?? 1,
          pageSize: pageSize ?? 40,
        },
      );

    return right({
      projects,
      pagination,
    });
  }
}
