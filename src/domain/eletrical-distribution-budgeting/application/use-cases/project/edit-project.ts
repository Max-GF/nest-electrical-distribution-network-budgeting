import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { ProjectsRepository } from "../../repositories/projects-repository";

export interface EditProjectUseCaseRequest {
  projectId: string;
  name?: string;
  description?: string;
  budgetAlreadyCalculated?: boolean;
}

type EditProjectUseCaseResponse = Either<
  AlreadyRegisteredError | NotAllowedError,
  {
    project: Project;
  }
>;

@Injectable()
export class EditProjectUseCase {
  constructor(private projectsRepository: ProjectsRepository) {}

  async execute(
    requestBody: EditProjectUseCaseRequest,
  ): Promise<EditProjectUseCaseResponse> {
    if (this.noEntries(requestBody)) {
      return left(
        new NotAllowedError("At least one field must be provided to edit"),
      );
    }
    let hasToEdit = false;
    const { projectId, name, description, budgetAlreadyCalculated } =
      requestBody;
    const projectToEdit = await this.projectsRepository.findById(projectId);
    if (!projectToEdit) {
      return left(new AlreadyRegisteredError("Project not found"));
    }

    if (name && name !== projectToEdit.name) {
      projectToEdit.name = name;
      hasToEdit = true;
    }
    if (description && description !== projectToEdit.description) {
      projectToEdit.description = description;
      hasToEdit = true;
    }
    if (
      budgetAlreadyCalculated !== undefined &&
      budgetAlreadyCalculated !== projectToEdit.budgetAlreadyCalculated
    ) {
      projectToEdit.budgetAlreadyCalculated = budgetAlreadyCalculated;
      hasToEdit = true;
    }
    if (!hasToEdit) {
      return left(
        new NotAllowedError("At least one field must be different to edit"),
      );
    }

    await this.projectsRepository.save(projectToEdit);
    return right({
      project: projectToEdit,
    });
  }
  noEntries(editProjectUseCaseRequest: EditProjectUseCaseRequest): boolean {
    return Object.entries(editProjectUseCaseRequest).every(
      ([key, value]) => value === undefined || key === "projectId",
    );
  }
}
