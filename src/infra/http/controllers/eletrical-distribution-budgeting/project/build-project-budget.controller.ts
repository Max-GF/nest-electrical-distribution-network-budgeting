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
import { BuildProjectBudgetUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/build-project-budget";
import { z } from "zod";
import { ZodValidationPipe } from "../../../pipes/zod-validation-pipe";
import { CalculateBudgetPresenter } from "../../../presenters/eletrical-distribution-budgeting/calculate-budget-presenter";
import { ValidateManyPointsDto } from "../../../swagger/eletrical-distribution-budgeting/dto/point/validate-many-points.dto";
import { BuildProjectBudgetResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/project/build-project-budget.response";

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

const buildProjectBudgetBodySchema = z.object({
  points: z.array(pointToValidateRequestSchema),
});

type BuildProjectBudgetBodySchema = z.infer<
  typeof buildProjectBudgetBodySchema
>;

@Controller("/projects/:projectId/budget/build")
export class BuildProjectBudgetController {
  constructor(private buildProjectBudgetUseCase: BuildProjectBudgetUseCase) {}

  @Post()
  @BuildProjectBudgetResponse()
  @ApiBody({ type: ValidateManyPointsDto })
  async handle(
    @Body(new ZodValidationPipe(buildProjectBudgetBodySchema))
    body: BuildProjectBudgetBodySchema,
    @Param("projectId") projectId: string,
  ) {
    const { points } = body;

    const result = await this.buildProjectBudgetUseCase.execute({
      projectId,
      points,
    });

    if (result.isLeft()) {
      const error = result.value;
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

    const { projectMaterials } = result.value;

    return projectMaterials.map(CalculateBudgetPresenter.toHTTP);
  }
}
