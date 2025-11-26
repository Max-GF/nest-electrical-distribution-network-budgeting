import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NegativeScrewLengthError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-screw-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { CreateUtilityPoleUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/utility-pole/create-utility-pole";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { UtilityPolePresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/utility-pole-presenter";
import { CreateUtilityPoleDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/utility-pole/create-utility-pole.dto";
import { CreateUtilityPoleResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/utility-pole/create-utility-pole.response";
import { z } from "zod";

const createUtilityPoleBodySchema = z.object({
  code: z.number(),
  description: z.string(),
  unit: z.string(),
  strongSideSectionMultiplier: z.number(),
  mediumVoltageLevelsCount: z.number(),
  mediumVoltageStartSectionLengthInMM: z.number(),
  mediumVoltageSectionLengthAddBylevelInMM: z.number(),
  lowVoltageLevelsCount: z.number(),
  lowVoltageStartSectionLengthInMM: z.number(),
  lowVoltageSectionLengthAddBylevelInMM: z.number(),
});

@ApiTags("Utility Pole")
@Controller("/utility-poles")
export class CreateUtilityPoleController {
  constructor(private createUtilityPole: CreateUtilityPoleUseCase) {}

  @Post()
  @CreateUtilityPoleResponse()
  async handle(
    @Body(new ZodValidationPipe(createUtilityPoleBodySchema))
    body: CreateUtilityPoleDto,
  ): Promise<{
    message: string;
    utilityPole: ReturnType<typeof UtilityPolePresenter.toHttp>;
  }> {
    const result = await this.createUtilityPole.execute(body);

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
        case NegativeScrewLengthError:
          throw new UnprocessableEntityException(error.message);
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    return {
      message: "Utility pole created successfully",
      utilityPole: UtilityPolePresenter.toHttp(result.value.utilityPole),
    };
  }
}
