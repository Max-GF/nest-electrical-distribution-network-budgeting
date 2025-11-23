import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { Project } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project";
import { ProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";
import { ProjectsBudgetRepository } from "../../repositories/projects-budget-repository";
import { CalculateBudgetUseCase } from "../budget/calculate-budget";
import {
  ValidateManyPointsUseCase,
  ValidateManyPointsUseCaseRequest,
} from "../point/validate-many-points";

type BuildProjectBudgetUseCaseResponse = Either<
  AlreadyRegisteredError | ResourceNotFoundError | NotAllowedError,
  {
    project: Project;
    projectMaterials: ProjectMaterial[];
  }
>;

@Injectable()
export class BuildProjectBudgetUseCase {
  constructor(
    private validateManyPointsUseCase: ValidateManyPointsUseCase,
    private calculateBudgetUseCase: CalculateBudgetUseCase,
    private projectsBudgetRepository: ProjectsBudgetRepository,
  ) {}

  async execute({
    projectId,
    points,
  }: ValidateManyPointsUseCaseRequest): Promise<BuildProjectBudgetUseCaseResponse> {
    const validatePointsResult = await this.validateManyPointsUseCase.execute({
      projectId,
      points,
    });
    if (validatePointsResult.isLeft()) {
      return left(validatePointsResult.value);
    }
    const { project, parsedPoints } = validatePointsResult.value;
    const calculateBudgetResult = await this.calculateBudgetUseCase.execute({
      project,
      parsedPoints,
    });
    if (calculateBudgetResult.isLeft()) {
      return left(calculateBudgetResult.value);
    }
    const { projectMaterials } = calculateBudgetResult.value;
    const pointsToSave = parsedPoints.map((parsedPoint) => parsedPoint.point);

    project.budgetAlreadyCalculated = true;
    try {
      await this.projectsBudgetRepository.saveProjectBudgetMaterials(
        project,
        pointsToSave,
        projectMaterials,
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return left(
        new NotAllowedError(
          "Could not save project budget materials, error details: " + message,
        ),
      );
    }
    return right({
      project,
      projectMaterials,
    });
  }
}
