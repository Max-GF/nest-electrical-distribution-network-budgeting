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
import { CreateCableConnectorUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable-connector/create-cable-connector";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CableConnectorPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/cable-connector-presenter";
import { CreateCableConnectorDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/cable-connector/create-cable-connector.dto";
import { CreateCableConnectorResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/cable-connector/create-cable-connector.response";
import { z } from "zod";

const createCableConnectorBodySchema = z.object({
  code: z.number(),
  description: z.string(),
  unit: z.string(),
  entranceMinValueMM: z.number(),
  entranceMaxValueMM: z.number(),
  exitMinValueMM: z.number(),
  exitMaxValueMM: z.number(),
});

@ApiTags("Cable Connector")
@Controller("/cable-connectors")
export class CreateCableConnectorController {
  constructor(private createCableConnector: CreateCableConnectorUseCase) {}

  @Post()
  @CreateCableConnectorResponse()
  async handle(
    @Body(new ZodValidationPipe(createCableConnectorBodySchema))
    body: CreateCableConnectorDto,
  ): Promise<{
    message: string;
    cableConnector: ReturnType<typeof CableConnectorPresenter.toHttp>;
  }> {
    const result = await this.createCableConnector.execute(body);

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        case NegativeCableSectionError:
        case NotAllowedError:
          throw new UnprocessableEntityException(error.message);
        default:
          throw new InternalServerErrorException("Unexpected error occurred");
      }
    }

    const { cableConnector } = result.value;

    return {
      message: "Cable connector created successfully",
      cableConnector: CableConnectorPresenter.toHttp(cableConnector),
    };
  }
}
