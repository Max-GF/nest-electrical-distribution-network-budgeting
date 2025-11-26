import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Param,
  Put,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { EditMaterialUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/material/edit-material";
import { EditMaterialResponse } from "src/infra/http/swagger/eletrical-distribution-budgeting/responses/material/edit-material.response";
import { z } from "zod";
import { MaterialPresenter } from "src/infra/http/presenters/eletrical-distribution-budgeting/material-presenter";

const editMaterialBodySchema = z.object({
  description: z.string().optional(),
  unit: z.string().optional(),
  tension: z.string().optional(),
});

type EditMaterialBodySchema = z.infer<typeof editMaterialBodySchema>;

@ApiTags("Materials")
@Controller("/materials/:id")
export class EditMaterialController {
  constructor(private editMaterial: EditMaterialUseCase) {}

  @Put()
  @HttpCode(200)
  @EditMaterialResponse()
  async handle(
    @Body(new ZodValidationPipe(editMaterialBodySchema))
    body: EditMaterialBodySchema,
    @Param("id") materialId: string,
  ) {
    const { description, unit, tension } = body;

    const result = await this.editMaterial.execute({
      materialId,
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
