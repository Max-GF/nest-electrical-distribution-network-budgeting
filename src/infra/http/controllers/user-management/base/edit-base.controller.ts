import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { EditBaseUseCase } from "src/domain/user-management/application/use-cases/base/edit-base";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { BasePresenter } from "src/infra/http/presenters/user-management/base-presenter";
import { EditBaseDto } from "src/infra/http/swagger/user-management/dto/edit-base.dto";
import { EditBaseResponse } from "src/infra/http/swagger/user-management/responses/edit-base.response";
import { z } from "zod";

const editBaseBodySchema = z.object({
  baseId: z.string().uuid(),
  name: z.string().max(100).toUpperCase(),
});

@ApiTags("Base")
@Controller("/bases/:id")
export class EditBaseController {
  constructor(private editBase: EditBaseUseCase) {}
  @Put()
  @EditBaseResponse()
  async handle(
    @Body(new ZodValidationPipe(editBaseBodySchema))
    body: EditBaseDto,
    @Param("id") baseId: string,
    @CurrentUser() user: UserPayload,
  ): Promise<{
    message: string;
    base: ReturnType<typeof BasePresenter.toHttp>;
  }> {
    const { name } = body;
    const result = await this.editBase.execute({
      actualUserCompanyId: user.companyId,
      baseId,
      name,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        case NotAllowedError:
          throw new ForbiddenException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }
    return {
      message: "Base edited successfully",
      base: BasePresenter.toHttp(result.value.base),
    };
  }
}
