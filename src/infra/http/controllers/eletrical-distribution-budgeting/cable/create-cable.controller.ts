import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { CreateCableUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/create-cable";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CablePresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/cable-presenter";
import { CreateCableDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/cable/create-cable.dto";
import { CreateCableResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/cable/create-cable.response";
import { z } from "zod";

const createCableBodySchema = z.object({
  code: z.number(),
  description: z.string(),
  unit: z.string(),
  tension: z.string(),
  sectionAreaInMM: z.number(),
});

@ApiTags("Cable")
@Controller("/cables")
export class CreateCableController {
  constructor(private createCable: CreateCableUseCase) {}

  @Post()
  @CreateCableResponse()
  async handle(
    @Body(new ZodValidationPipe(createCableBodySchema))
    body: CreateCableDto,
  ): Promise<{
    message: string;
    cable: ReturnType<typeof CablePresenter.toHttp>;
  }> {
    const { code, description, unit, tension, sectionAreaInMM } = body;
    const result = await this.createCable.execute({
      code,
      description,
      unit,
      tension,
      sectionAreaInMM,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
        case NegativeCableSectionError:
          throw new UnprocessableEntityException(error.message);
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    return {
      message: "Cable created successfully",
      cable: CablePresenter.toHttp(result.value.cable),
    };
  }
}
