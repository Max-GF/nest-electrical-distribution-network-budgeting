import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateBulkOfCableConnectorsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable-connector/create-bulk-of-cable-connectors";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CableConnectorPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/cable-connector-presenter";
import { CreateBulkOfCableConnectorsDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/cable-connector/create-bulk-of-cable-connectors.dto";
import { CreateBulkOfCableConnectorsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/cable-connector/create-bulk-of-cable-connectors.response";
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

const createBulkOfCableConnectorsBodySchema = z.object({
  cableConnectors: z.array(createCableConnectorBodySchema),
});

@ApiTags("Cable Connector")
@Controller("/cable-connectors/bulk")
export class CreateBulkOfCableConnectorsController {
  constructor(
    private createBulkOfCableConnectors: CreateBulkOfCableConnectorsUseCase,
  ) {}

  @Post()
  @CreateBulkOfCableConnectorsResponse()
  async handle(
    @Body(new ZodValidationPipe(createBulkOfCableConnectorsBodySchema))
    body: CreateBulkOfCableConnectorsDto,
  ): Promise<{
    message: string;
    cableConnectors: ReturnType<typeof CableConnectorPresenter.toHttp>[];
  }> {
    const result = await this.createBulkOfCableConnectors.execute(
      body.cableConnectors,
    );

    const { created } = result.value;

    return {
      message: "Cable connectors created successfully",
      cableConnectors: created.map(CableConnectorPresenter.toHttp),
    };
  }
}
