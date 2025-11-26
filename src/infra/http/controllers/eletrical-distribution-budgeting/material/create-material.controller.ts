import {
    BadRequestException,
    Body,
    Controller,
    Post,
    UsePipes,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { CreateMaterialUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/material/create-material";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { MaterialPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/material-presenter";
import { CreateMaterialResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/material/create-material.response";
import { z } from "zod";

const createMaterialBodySchema = z.object({
  code: z.number(),
  description: z.string(),
  unit: z.string(),
  tension: z.string(),
});

type CreateMaterialBodySchema = z.infer<typeof createMaterialBodySchema>;

@ApiTags("Materials")
@Controller("/materials")
export class CreateMaterialController {
  constructor(private createMaterial: CreateMaterialUseCase) {}

  @Post()
  @CreateMaterialResponse()
  @UsePipes(new ZodValidationPipe(createMaterialBodySchema))
  async handle(@Body() body: CreateMaterialBodySchema) {
    const { code, description, unit, tension } = body;

    const result = await this.createMaterial.execute({
      code,
      description,
      unit,
      tension,
    });

    if (result.isLeft()) {
      const error = result.value;
      throw new BadRequestException(error.message);
    }

    const { material } = result.value;

    return {
      material: MaterialPresenter.toHttp(material),
    };
  }
}
