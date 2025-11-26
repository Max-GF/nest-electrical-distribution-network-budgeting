import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateBulkOfCablesUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/cable/create-bulk-of-cables";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CablePresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/cable-presenter";
import { CreateBulkOfCablesDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/cable/create-bulk-of-cables.dto";
import { CreateBulkOfCablesResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/cable/create-bulk-of-cables.response";
import { z } from "zod";

const createBulkOfCablesBodySchema = z.object({
  cables: z.array(
    z.object({
      code: z.number(),
      description: z.string(),
      unit: z.string(),
      tension: z.string(),
      sectionAreaInMM: z.number(),
    }),
  ),
});

@ApiTags("Cable")
@Controller("/cables/bulk")
export class CreateBulkOfCablesController {
  constructor(private createBulkOfCables: CreateBulkOfCablesUseCase) {}

  @Post()
  @CreateBulkOfCablesResponse()
  async handle(
    @Body(new ZodValidationPipe(createBulkOfCablesBodySchema))
    body: CreateBulkOfCablesDto,
  ): Promise<{
    message: string;
    created: ReturnType<typeof CablePresenter.toHttp>[];
    failed: { error: object; cable: object }[];
  }> {
    const { cables } = body;
    const result = await this.createBulkOfCables.execute(cables);

    if (result.isLeft()) {
      // This use case currently returns right(never) or right(result), so this might not be reached
      // but good to have for safety if implementation changes
      throw new Error("Unexpected error");
    }

    const { created, failed } = result.value;

    return {
      message: "Cables processed successfully",
      created: created.map(CablePresenter.toHttp),
      failed,
    };
  }
}
