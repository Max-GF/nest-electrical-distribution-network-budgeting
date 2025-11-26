import {
  Controller,
  Get,
  InternalServerErrorException,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FetchWithFilterUtilityPoleUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/utility-pole/fetch-utility-poles-with-filter";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { UtilityPolePresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/utility-pole-presenter";
import { FetchUtilityPolesWithFilterOptionsDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/utility-pole/fetch-utility-poles-with-filter-options.dto";
import { FetchUtilityPolesWithFilterOptionsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/utility-pole/fetch-utility-poles-with-filter-options.response";
import { z } from "zod";

const fetchUtilityPolesQuerySchema = z.object({
  codes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const arr = Array.isArray(val) ? val : [val];
      return arr.map((code) => Number(code));
    }),
  description: z.string().optional(),
  minimumCountForMediumVoltageLevels: z.coerce.number().optional(),
  minimumCountForLowVoltageLevels: z.coerce.number().optional(),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(20),
});

@ApiTags("Utility Pole")
@Controller("/utility-poles")
export class FetchUtilityPolesWithFilterOptionsController {
  constructor(private fetchUtilityPoles: FetchWithFilterUtilityPoleUseCase) {}

  @Get()
  @FetchUtilityPolesWithFilterOptionsResponse()
  async handle(
    @Query(new ZodValidationPipe(fetchUtilityPolesQuerySchema))
    query: FetchUtilityPolesWithFilterOptionsDto,
  ) {
    const result = await this.fetchUtilityPoles.execute(query);

    if (result.isLeft()) {
      throw new InternalServerErrorException("Unexpected error");
    }

    const { utilityPoles, pagination } = result.value;

    return {
      utilityPoles: utilityPoles.map(UtilityPolePresenter.toHttp),
      pagination,
    };
  }
}
