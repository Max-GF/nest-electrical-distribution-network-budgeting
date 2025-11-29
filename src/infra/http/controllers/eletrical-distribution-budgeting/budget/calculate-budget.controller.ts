import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { ApiBody } from "@nestjs/swagger";
import { CalculateBudgetUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/budget/calculate-budget";
import { ValidateManyPointsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/validate-many-points";
import { z } from "zod";
import { ZodValidationPipe } from "../../../pipes/zod-validation-pipe";
import { CalculateBudgetPresenter } from "../../../presenters/eletrical-distribution-budgeting/calculate-budget-presenter";
import { ValidateManyPointsDto } from "../../../swagger/eletrical-distribution-budgeting/dto/point/validate-many-points.dto";
import { CalculateBudgetResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/budget/calculate-budget.response";

const cableRequestSchema = z.object({
  isNew: z.boolean(),
  cableId: z.string().uuid(),
});

const lowTensionCablesRequestSchema = z.object({
  entranceCable: cableRequestSchema,
  exitCable: cableRequestSchema.optional(),
});

const mediumTensionCablesRequestSchema = z.object({
  entranceCable: cableRequestSchema,
  exitCable: cableRequestSchema.optional(),
});

const pointCablesRequestSchema = z.object({
  lowTensionCables: lowTensionCablesRequestSchema.optional(),
  mediumTensionCables: mediumTensionCablesRequestSchema.optional(),
});

const pointUtilityPoleRequestSchema = z.object({
  isNew: z.boolean(),
  utilityPoleId: z.string().uuid(),
});

const pointGroupRequestSchema = z.object({
  tensionLevel: z.enum(["LOW", "MEDIUM"]),
  level: z.number(),
  groupId: z.string().uuid(),
});

const untiedMaterialRequestSchema = z.object({
  quantity: z.number(),
  materialId: z.string().uuid(),
});

const pointToValidateRequestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  pointUtilityPole: pointUtilityPoleRequestSchema,
  pointCables: pointCablesRequestSchema,
  pointGroups: z.array(pointGroupRequestSchema).optional(),
  untiedMaterials: z.array(untiedMaterialRequestSchema).optional(),
});

const calculateBudgetBodySchema = z.object({
  points: z.array(pointToValidateRequestSchema),
});

type CalculateBudgetBodySchema = z.infer<typeof calculateBudgetBodySchema>;

@Controller("/projects/:projectId/budget/calculate")
export class CalculateBudgetController {
  constructor(
    private validateManyPointsUseCase: ValidateManyPointsUseCase,
    private calculateBudgetUseCase: CalculateBudgetUseCase,
  ) {}

  @Post()
  @CalculateBudgetResponse()
  @ApiBody({ type: ValidateManyPointsDto })
  async handle(
    @Body(new ZodValidationPipe(calculateBudgetBodySchema))
    body: CalculateBudgetBodySchema,
    @Param("projectId") projectId: string,
  ) {
    const { points } = body;

    const validationResult = await this.validateManyPointsUseCase.execute({
      points,
      projectId,
    });

    if (validationResult.isLeft()) {
      const error = validationResult.value;
      switch (error.constructor.name) {
        case "ResourceNotFoundError":
          throw new NotFoundException(error.message);
        case "AlreadyRegisteredError":
          throw new ConflictException(error.message);
        case "NotAllowedError":
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { parsedPoints, project } = validationResult.value;

    const budgetResult = await this.calculateBudgetUseCase.execute({
      project,
      parsedPoints,
    });

    if (budgetResult.isLeft()) {
      const error = budgetResult.value;
      switch (error.constructor.name) {
        case "ResourceNotFoundError":
          throw new NotFoundException(error.message);
        case "NotAllowedError":
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { projectMaterials } = budgetResult.value;

    return projectMaterials.map(CalculateBudgetPresenter.toHTTP);
  }
}
