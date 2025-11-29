import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Param,
  Put,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { EditPointUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/point/edit-point";
import { PointPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/point-presenter";
import { EditPointDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/point/edit-point.dto";
import { EditPointResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/point/edit-point.response";

@ApiTags("Points")
@Controller("/points/:id")
export class EditPointController {
  constructor(private editPointUseCase: EditPointUseCase) {}

  @Put()
  @EditPointResponse()
  async handle(@Param("id") id: string, @Body() body: EditPointDto) {
    const {
      description,
      lowTensionEntranceCableId,
      lowTensionExitCableId,
      mediumTensionEntranceCableId,
      mediumTensionExitCableId,
      utilityPoleId,
    } = body;

    const result = await this.editPointUseCase.execute({
      pointId: id,
      description,
      lowTensionEntranceCableId,
      lowTensionExitCableId,
      mediumTensionEntranceCableId,
      mediumTensionExitCableId,
      utilityPoleId,
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

    const { point } = result.value;

    return {
      point: PointPresenter.toHttp(point),
    };
  }
}
