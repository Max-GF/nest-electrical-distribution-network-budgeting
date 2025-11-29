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
import { NegativeCableSectionError } from "src/core/errors/erros-eletrical-distribution-budgeting/negative-cable-section-length-error";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { EditCableConnectorUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable-connector/edit-cable-connector";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CableConnectorPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/cable-connector-presenter";
import { EditCableConnectorDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/cable-connector/edit-cable-connector.dto";
import { EditCableConnectorResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/cable-connector/edit-cable-connector.response";
import { z } from "zod";

const editCableConnectorBodySchema = z.object({
  code: z.number().optional(),
  description: z.string().optional(),
  unit: z.string().optional(),
  entranceMinValueMM: z.number().optional(),
  entranceMaxValueMM: z.number().optional(),
  exitMinValueMM: z.number().optional(),
  exitMaxValueMM: z.number().optional(),
});

@ApiTags("Cable Connector")
@Controller("/cable-connectors/:id")
export class EditCableConnectorController {
  constructor(private editCableConnector: EditCableConnectorUseCase) {}

  @Put()
  @EditCableConnectorResponse()
  async handle(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(editCableConnectorBodySchema))
    body: EditCableConnectorDto,
  ): Promise<{
    message: string;
    cableConnector: ReturnType<typeof CableConnectorPresenter.toHttp>;
  }> {
    const result = await this.editCableConnector.execute({
      cableConnectorId: id,
      ...body,
    });

    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new ConflictException(error.message);
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
      message: "Cable connector updated successfully",
      cableConnector: CableConnectorPresenter.toHttp(cableConnector),
    };
  }
}
