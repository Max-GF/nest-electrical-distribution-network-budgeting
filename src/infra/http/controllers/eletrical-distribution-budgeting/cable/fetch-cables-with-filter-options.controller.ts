import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { NotAllowedError } from "src/core/errors/generics/not-allowed-error";
import { FetchCablesWithFilterOptionsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/fetch-cables-with-filter-options";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CablePresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/cable-presenter";
import { FetchCablesWithFilterOptionsDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/cable/fetch-cables-with-filter-options.dto";
import { FetchCablesWithFilterOptionsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/cable/fetch-cables-with-filter-options.response";
import { z } from "zod";

const fetchCablesQuerySchema = z.object({
  codes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const arr = Array.isArray(val) ? val : [val];
      return arr.map((code) => Number(code));
    }),
  description: z.string().optional(),
  tension: z.string().optional(),
  maxSectionAreaInMM: z.coerce.number().optional(),
  minSectionAreaInMM: z.coerce.number().optional(),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).optional().default(20),
});

@ApiTags("Cable")
@Controller("/cables")
export class FetchCablesWithFilterOptionsController {
  constructor(private fetchCables: FetchCablesWithFilterOptionsUseCase) {}

  @Get()
  @FetchCablesWithFilterOptionsResponse()
  async handle(
    @Query(new ZodValidationPipe(fetchCablesQuerySchema))
    query: FetchCablesWithFilterOptionsDto,
  ) {
    const {
      codes,
      description,
      tension,
      maxSectionAreaInMM,
      minSectionAreaInMM,
      page,
      pageSize,
    } = query;

    const result = await this.fetchCables.execute({
      codes,
      description,
      tension,
      maxSectionAreaInMM,
      minSectionAreaInMM,
      page,
      pageSize,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case NotAllowedError:
          throw new UnprocessableEntityException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    const { cables, pagination } = result.value;

    return {
      cables: cables.map(CablePresenter.toHttp),
      pagination,
    };
  }
}
