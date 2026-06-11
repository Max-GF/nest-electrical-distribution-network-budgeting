import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { ValidateManyPointsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/validate-many-points";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { ValidateManyPointsPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/validate-many-points-presenter";
import { ValidateManyPointsDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/point/validate-many-points.dto";
import { ValidateManyPointsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/point/validate-many-points.response";
import { z } from "zod";

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

const validateManyPointsBodySchema = z.object({
  points: z.array(pointToValidateRequestSchema),
});

const validateManyPointsParamsSchema = z.object({
  projectId: z.string().uuid(),
});

@ApiTags("Points")
@Controller("/projects/:projectId/points/validate")
export class ValidateManyPointsController {
  constructor(private validateManyPointsUseCase: ValidateManyPointsUseCase) {}

  @Post()
  @ValidateManyPointsResponse()
  async handle(
    @Param(new ZodValidationPipe(validateManyPointsParamsSchema))
    params: { projectId: string },
    @Body(new ZodValidationPipe(validateManyPointsBodySchema))
    body: ValidateManyPointsDto,
  ) {
    const { projectId } = params;
    const { points } = body;

    const result = await this.validateManyPointsUseCase.execute({
      projectId,
      points,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }

      if (error instanceof AlreadyRegisteredError) {
        throw new ConflictException(error.message);
      }

      if (error instanceof NotAllowedError) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException();
    }

    const { project, parsedPoints } = result.value;

    return {
      projectName: project.name,
      parsedPoints: parsedPoints.map(ValidateManyPointsPresenter.toHttp),
    };
  }
}
