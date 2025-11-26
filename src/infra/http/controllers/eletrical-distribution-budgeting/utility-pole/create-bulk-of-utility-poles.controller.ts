import { Body, Controller, HttpStatus, Post, Res } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateBulkOfUtilityPolesUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/utility-pole/create-bulk-of-utility-poles";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { UtilityPolePresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/utility-pole-presenter";
import { CreateBulkOfUtilityPolesDto } from "src/infra/http/swagger/eletrical-distribution-budgeting/dto/utility-pole/create-bulk-of-utility-poles.dto";
import { CreateBulkOfUtilityPolesResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/utility-pole/create-bulk-of-utility-poles.response";
import { z } from "zod";

const createBulkOfUtilityPolesBodySchema = z.object({
  utilityPoles: z.array(
    z.object({
      code: z.number(),
      description: z.string(),
      unit: z.string(),
      strongSideSectionMultiplier: z.number(),
      mediumVoltageLevelsCount: z.number(),
      mediumVoltageStartSectionLengthInMM: z.number(),
      mediumVoltageSectionLengthAddBylevelInMM: z.number(),
      lowVoltageLevelsCount: z.number(),
      lowVoltageStartSectionLengthInMM: z.number(),
      lowVoltageSectionLengthAddBylevelInMM: z.number(),
    }),
  ),
});

@ApiTags("Utility Pole")
@Controller("/utility-poles/bulk")
export class CreateBulkOfUtilityPolesController {
  constructor(
    private createBulkOfUtilityPoles: CreateBulkOfUtilityPolesUseCase,
  ) {}

  @Post()
  @CreateBulkOfUtilityPolesResponse()
  async handle(
    @Body(new ZodValidationPipe(createBulkOfUtilityPolesBodySchema))
    body: CreateBulkOfUtilityPolesDto,
    @Res() res: Response,
  ): Promise<{
    message: string;
    created: ReturnType<typeof UtilityPolePresenter.toHttp>[];
    failed: { error: object; utilityPole: object }[];
  }> {
    const { utilityPoles } = body;
    const result = await this.createBulkOfUtilityPoles.execute(utilityPoles);

    if (result.isLeft()) {
      throw new Error("Unexpected error");
    }

    const { created, failed } = result.value;
    return res
      .status(
        failed.length > 0 ? HttpStatus.PARTIAL_CONTENT : HttpStatus.CREATED,
      )
      .json({
        message: `Utility poles processed ${failed.length > 0 ? "partially " : ""}successfully`,
        created: created.map(UtilityPolePresenter.toHttp),
        failed,
      });
  }
}
