import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateBulkOfPoleScrewsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/pole-screw/create-bulk-of-pole-screws";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { PoleScrewPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/pole-screw-presenter";
import { CreateBulkOfPoleScrewsDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/pole-screw/create-bulk-of-pole-screws.dto";
import { CreateBulkOfPoleScrewsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/pole-screw/create-bulk-of-pole-screws.response";
import { z } from "zod";

const createPoleScrewBodySchema = z.object({
  code: z.number(),
  description: z.string(),
  unit: z.string(),
  lengthInMM: z.number(),
});

const createBulkOfPoleScrewsBodySchema = z.object({
  poleScrews: z.array(createPoleScrewBodySchema),
});

@ApiTags("Pole Screw")
@Controller("/pole-screws/bulk")
export class CreateBulkOfPoleScrewsController {
  constructor(private createBulkOfPoleScrews: CreateBulkOfPoleScrewsUseCase) {}

  @Post()
  @CreateBulkOfPoleScrewsResponse()
  async handle(
    @Body(new ZodValidationPipe(createBulkOfPoleScrewsBodySchema))
    body: CreateBulkOfPoleScrewsDto,
  ): Promise<{
    message: string;
    poleScrews: ReturnType<typeof PoleScrewPresenter.toHttp>[];
  }> {
    const result = await this.createBulkOfPoleScrews.execute(body.poleScrews);

    const { created } = result.value;

    return {
      message: "Pole screws created successfully",
      poleScrews: created.map(PoleScrewPresenter.toHttp),
    };
  }
}
