import {
  Body,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Put,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { EditCableUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/edit-cable";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CablePresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/cable-presenter";
import { EditCableDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/cable/edit-cable.dto";
import { EditCableResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/cable/edit-cable.response";
import { z } from "zod";

const editCableBodySchema = z.object({
  description: z.string().optional(),
  unit: z.string().optional(),
  tension: z.string().optional(),
  sectionAreaInMM: z.number().optional(),
});

@ApiTags("Cable")
@Controller("/cables/:id")
export class EditCableController {
  constructor(private editCable: EditCableUseCase) {}

  @Put()
  @EditCableResponse()
  async handle(
    @Body(new ZodValidationPipe(editCableBodySchema))
    body: EditCableDto,
    @Param("id") cableId: string,
  ): Promise<{
    message: string;
    cable: ReturnType<typeof CablePresenter.toHttp>;
  }> {
    const { description, unit, tension, sectionAreaInMM } = body;
    const result = await this.editCable.execute({
      cableId,
      description,
      unit,
      tension,
      sectionAreaInMM,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
        case NegativeCableSectionError:
          throw new UnprocessableEntityException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    return {
      message: "Cable edited successfully",
      cable: CablePresenter.toHttp(result.value.cable),
    };
  }
}
