import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { ProjectsRepository } from "../../repositories/projects-repository";

export interface CreateProjectUseCaseRequest {
  name: string;
  description: string;
  budgetAlreadyCalculated: boolean;
}

type CreateProjectUseCaseResponse = Either<
  AlreadyRegisteredError,
  {
    project: Project;
  }
>;

@Injectable()
export class CreateProjectUseCase {
  constructor(private projectsRepository: ProjectsRepository) {}

  async execute({
    name,
    budgetAlreadyCalculated,
    description,
  }: CreateProjectUseCaseRequest): Promise<CreateProjectUseCaseResponse> {
    const projectWithSameName = await this.projectsRepository.findByName(name);
    if (projectWithSameName) {
      return left(
        new AlreadyRegisteredError("Project name already registered"),
      );
    }

    const project = Project.create({
      name,
      description,
      budgetAlreadyCalculated,
      lastBudgetCalculatedAt: budgetAlreadyCalculated ? new Date() : undefined,
    });

    await this.projectsRepository.createMany([project]);
    return right({
      project,
    });
  }
}
