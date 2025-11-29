import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FetchWithFilterMaterialsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/material/fetch-materials-with-filter-options";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { MaterialPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/material-presenter";
import { FetchMaterialsWithFilterOptionsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/material/fetch-materials-with-filter-options.response";
import { z } from "zod";

const fetchMaterialsWithFilterOptionsQuerySchema = z.object({
  codes: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",").map(Number) : undefined)),
  description: z.string().optional(),
  tension: z.string().optional(),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(10),
});

type FetchMaterialsWithFilterOptionsQuerySchema = z.infer<
  typeof fetchMaterialsWithFilterOptionsQuerySchema
>;

@ApiTags("Materials")
@Controller("/materials")
export class FetchMaterialsWithFilterOptionsController {
  constructor(
    private fetchMaterialsWithFilterOptions: FetchWithFilterMaterialsUseCase,
  ) {}

  @Get()
  @FetchMaterialsWithFilterOptionsResponse()
  @UsePipes(new ZodValidationPipe(fetchMaterialsWithFilterOptionsQuerySchema))
  async handle(@Query() query: FetchMaterialsWithFilterOptionsQuerySchema) {
    const { codes, description, tension, page, pageSize } = query;

    const result = await this.fetchMaterialsWithFilterOptions.execute({
      codes,
      description,
      tension,
      page,
      pageSize,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }

    const { materials, pagination } = result.value;

    return {
      materials: materials.map(MaterialPresenter.toHttp),
      pagination,
    };
  }
}
