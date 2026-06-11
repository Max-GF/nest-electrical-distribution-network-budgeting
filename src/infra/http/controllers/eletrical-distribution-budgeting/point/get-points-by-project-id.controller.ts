import { BadRequestException, Controller, Get, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { GetProjectPointUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/get-points-by-project-id";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { PointPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/point-presenter";
import { GetPointsByProjectIdResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/point/get-points-by-project-id.response";
import { z } from "zod";

const getPointsByProjectIdParamsSchema = z.object({
  projectId: z.string().uuid(),
});

@ApiTags("Points")
@Controller("/projects/:projectId/points")
export class GetPointsByProjectIdController {
  constructor(private getProjectPointUseCase: GetProjectPointUseCase) {}

  @Get()
  @GetPointsByProjectIdResponse()
  async handle(
    @Param(new ZodValidationPipe(getPointsByProjectIdParamsSchema))
    params: {
      projectId: string;
    },
  ) {
    const { projectId } = params;
    const result = await this.getProjectPointUseCase.execute({
      projectId,
    });

    if (result.isLeft()) {
      const error = result.value;

      if (error instanceof NotAllowedError) {
        throw new BadRequestException(error.message);
      }

      throw new BadRequestException();
    }

    const { points } = result.value;

    return {
      points: points.map(PointPresenter.toHttpWithDetails),
    };
  }
}
