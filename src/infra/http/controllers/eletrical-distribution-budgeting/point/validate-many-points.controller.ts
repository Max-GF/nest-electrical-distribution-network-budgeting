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
import { ValidateManyPointsPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/validate-many-points-presenter";
import { ValidateManyPointsDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/point/validate-many-points.dto";
import { ValidateManyPointsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/point/validate-many-points.response";

@ApiTags("Points")
@Controller("/projects/:projectId/points/validate")
export class ValidateManyPointsController {
  constructor(private validateManyPointsUseCase: ValidateManyPointsUseCase) {}

  @Post()
  @ValidateManyPointsResponse()
  async handle(
    @Param("projectId") projectId: string,
    @Body() body: ValidateManyPointsDto,
  ) {
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
