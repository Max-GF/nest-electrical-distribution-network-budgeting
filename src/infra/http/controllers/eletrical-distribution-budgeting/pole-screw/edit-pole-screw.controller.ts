import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Param,
  Put,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { EditPoleScrewUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/pole-screw/edit-pole-screw";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { PoleScrewPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/pole-screw-presenter";
import { EditPoleScrewDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/pole-screw/edit-pole-screw.dto";
import { EditPoleScrewResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/pole-screw/edit-pole-screw.response";
import { z } from "zod";

const editPoleScrewBodySchema = z.object({
  code: z.number().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  lengthInMM: z.number().optional(),
});

@ApiTags("Pole Screw")
@Controller("/pole-screws/:id")
export class EditPoleScrewController {
  constructor(private editPoleScrew: EditPoleScrewUseCase) {}

  @Put()
  @EditPoleScrewResponse()
  async handle(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(editPoleScrewBodySchema))
    body: EditPoleScrewDto,
  ): Promise<{
    message: string;
    poleScrew: ReturnType<typeof PoleScrewPresenter.toHttp>;
  }> {
    const result = await this.editPoleScrew.execute({
      poleScrewId: id,
      ...body,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new ConflictException(error.message);
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        case NegativeScrewLengthError:
          throw new UnprocessableEntityException(error.message);
        default:
          throw new InternalServerErrorException("Unexpected error occurred");
      }
    }

    const { poleScrew } = result.value;

    return {
      message: "Pole screw updated successfully",
      poleScrew: PoleScrewPresenter.toHttp(poleScrew),
    };
  }
}
