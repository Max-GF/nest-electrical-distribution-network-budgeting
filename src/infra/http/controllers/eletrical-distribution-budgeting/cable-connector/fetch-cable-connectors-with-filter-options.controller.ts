import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FetchWithFilterCableConnectorUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable-connector/fetch-cable-connectors-with-filter-options";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CableConnectorPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/cable-connector-presenter";
import { FetchCableConnectorsWithFilterOptionsDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/cable-connector/fetch-cable-connectors-with-filter-options.dto";
import { FetchCableConnectorsWithFilterOptionsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/cable-connector/fetch-cable-connectors-with-filter-options.response";
import { z } from "zod";

const fetchCableConnectorsQuerySchema = z.object({
  codes: z
    .string()
    .optional()
    .transform((str) => {
      if (str === undefined) return undefined;
      return str
        .toUpperCase()
        .split(",")
        .map((tag) => Number(tag.trim()));
    }),
  description: z.string().optional(),

  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(20),
});

@ApiTags("Cable Connector")
@Controller("/cable-connectors")
export class FetchCableConnectorsWithFilterOptionsController {
  constructor(
    private fetchCableConnectors: FetchWithFilterCableConnectorUseCase,
  ) {}

  @Get()
  @FetchCableConnectorsWithFilterOptionsResponse()
  async handle(
    @Query(new ZodValidationPipe(fetchCableConnectorsQuerySchema))
    query: FetchCableConnectorsWithFilterOptionsDto,
  ): Promise<{
    cableConnectors: ReturnType<
      typeof CableConnectorPresenter.toHttpWithDetails
    >[];
    pagination: {
      actualPage: number;
      actualPageSize: number;
      lastPage: number;
    };
  }> {
    const result = await this.fetchCableConnectors.execute(query);
    if (result.isLeft()) {
      throw new InternalServerErrorException("Unexpected error occurred");
    }

    const { cableConnectors, pagination } = result.value;

    return {
      cableConnectors: cableConnectors.map(
        CableConnectorPresenter.toHttpWithDetails,
      ),
      pagination,
    };
  }
}
