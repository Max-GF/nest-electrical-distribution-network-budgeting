import {
    Controller,
    Get,
    InternalServerErrorException,
    Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FetchWithFilterPoleScrewUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/pole-screw/fetch-pole-screws-with-filter-options";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { PoleScrewPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/pole-screw-presenter";
import { FetchPoleScrewsWithFilterOptionsDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/pole-screw/fetch-pole-screws-with-filter-options.dto";
import { FetchPoleScrewsWithFilterOptionsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/pole-screw/fetch-pole-screws-with-filter-options.response";
import { z } from "zod";

const fetchPoleScrewsQuerySchema = z.object({
  codes: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      const arr = Array.isArray(val) ? val : [val];
      return arr.map((code) => Number(code));
    }),
  description: z.string().optional(),
  minLengthInMM: z.coerce.number().optional(),
  maxLengthInMM: z.coerce.number().optional(),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(20),
});

@ApiTags("Pole Screw")
@Controller("/pole-screws")
export class FetchPoleScrewsWithFilterOptionsController {
  constructor(private fetchPoleScrews: FetchWithFilterPoleScrewUseCase) {}

  @Get()
  @FetchPoleScrewsWithFilterOptionsResponse()
  async handle(
    @Query(new ZodValidationPipe(fetchPoleScrewsQuerySchema))
    query: FetchPoleScrewsWithFilterOptionsDto,
  ): Promise<{
    poleScrews: ReturnType<typeof PoleScrewPresenter.toHttp>[];
    pagination: {
      actualPage: number;
      actualPageSize: number;
      lastPage: number;
    };
  }> {
    const result = await this.fetchPoleScrews.execute(query);

    if (result.isLeft()) {
      throw new InternalServerErrorException("Unexpected error occurred");
    }

    const { poleScrews, pagination } = result.value;

    return {
      poleScrews: poleScrews.map(PoleScrewPresenter.toHttp),
      pagination,
    };
  }
}
