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
import { CreatePoleScrewUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/pole-screw/create-pole-screw";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { PoleScrewPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/pole-screw-presenter";
import { CreatePoleScrewDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/pole-screw/create-pole-screw.dto";
import { CreatePoleScrewResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/pole-screw/create-pole-screw.response";
import { z } from "zod";

const createPoleScrewBodySchema = z.object({
  code: z.number(),
  description: z.string(),
  unit: z.string(),
  lengthInMM: z.number(),
});

@ApiTags("Pole Screw")
@Controller("/pole-screws")
export class CreatePoleScrewController {
  constructor(private createPoleScrew: CreatePoleScrewUseCase) {}

  @Post()
  @CreatePoleScrewResponse()
  async handle(
    @Body(new ZodValidationPipe(createPoleScrewBodySchema))
    body: CreatePoleScrewDto,
  ): Promise<{
    message: string;
    poleScrew: ReturnType<typeof PoleScrewPresenter.toHttp>;
  }> {
    const result = await this.createPoleScrew.execute(body);

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
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
      message: "Pole screw created successfully",
      poleScrew: PoleScrewPresenter.toHttp(poleScrew),
    };
  }
}
