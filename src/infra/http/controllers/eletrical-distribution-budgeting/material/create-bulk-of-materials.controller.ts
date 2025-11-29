import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateBulkOfMaterialsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/material/create-bulk-of-materials";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { MaterialPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/material-presenter";
import { CreateBulkOfMaterialsResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/material/create-bulk-of-materials.response";
import { z } from "zod";

const createBulkOfMaterialsBodySchema = z.object({
  materials: z.array(
    z.object({
      code: z.number(),
      description: z.string(),
      unit: z.string(),
      tension: z.string(),
    }),
  ),
});

type CreateBulkOfMaterialsBodySchema = z.infer<
  typeof createBulkOfMaterialsBodySchema
>;

@ApiTags("Materials")
@Controller("/materials/bulk")
export class CreateBulkOfMaterialsController {
  constructor(private createBulkOfMaterials: CreateBulkOfMaterialsUseCase) {}

  @Post()
  @CreateBulkOfMaterialsResponse()
  @UsePipes(new ZodValidationPipe(createBulkOfMaterialsBodySchema))
  async handle(@Body() body: CreateBulkOfMaterialsBodySchema) {
    const { materials } = body;

    const result = await this.createBulkOfMaterials.execute(materials);

    if (result.isLeft()) {
      throw new BadRequestException();
    }

    const { created, failed } = result.value;

    return {
      created: created.map(MaterialPresenter.toHttp),
      failed,
    };
  }
}
