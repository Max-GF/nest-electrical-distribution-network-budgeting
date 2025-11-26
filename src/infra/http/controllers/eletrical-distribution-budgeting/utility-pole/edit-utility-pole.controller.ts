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
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { EditUtilityPoleUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/utility-pole/edit-utility-pole";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { UtilityPolePresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/utility-pole-presenter";
import { EditUtilityPoleDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/utility-pole/edit-utility-pole.dto";
import { EditUtilityPoleResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/utility-pole/edit-utility-pole.response";
import { z } from "zod";

const editUtilityPoleBodySchema = z.object({
  description: z.string().optional(),
  unit: z.string().optional(),
  strongSideSectionMultiplier: z.number().optional(),
  mediumVoltageLevelsCount: z.number().optional(),
  mediumVoltageStartSectionLengthInMM: z.number().optional(),
  mediumVoltageSectionLengthAddBylevelInMM: z.number().optional(),
  lowVoltageLevelsCount: z.number().optional(),
  lowVoltageStartSectionLengthInMM: z.number().optional(),
  lowVoltageSectionLengthAddBylevelInMM: z.number().optional(),
});

@ApiTags("Utility Pole")
@Controller("/utility-poles/:id")
export class EditUtilityPoleController {
  constructor(private editUtilityPole: EditUtilityPoleUseCase) {}

  @Put()
  @EditUtilityPoleResponse()
  async handle(
    @Body(new ZodValidationPipe(editUtilityPoleBodySchema))
    body: EditUtilityPoleDto,
    @Param("id") utilityPoleId: string,
  ): Promise<{
    message: string;
    utilityPole: ReturnType<typeof UtilityPolePresenter.toHttp>;
  }> {
    const result = await this.editUtilityPole.execute({
      utilityPoleId,
      ...body,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case NotAllowedError:
        case NegativeScrewLengthError:
          throw new UnprocessableEntityException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    return {
      message: "Utility pole edited successfully",
      utilityPole: UtilityPolePresenter.toHttp(result.value.utilityPole),
    };
  }
}
