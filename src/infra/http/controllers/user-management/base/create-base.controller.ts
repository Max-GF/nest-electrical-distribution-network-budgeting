import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  NotFoundException,
  Post,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { CreateBaseUseCase } from "src/domain/user-management/application/use-cases/base/create-base";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { BasePresenter } from "../../../presenters/user-management/base-presenter";
import { CreateBaseDto } from "../../../swagger/user-management/dto/create-base.dto";
import { CreateBaseResponse } from "../../../swagger/user-management/responses/create-base.response";

const createBaseBodySchema = z.object({
  name: z.string().min(6).max(100).toUpperCase(),
  companyId: z.string().uuid(),
});

@ApiTags("Base")
@Controller("/bases")
export class CreateBaseController {
  constructor(private createBase: CreateBaseUseCase) {}
  @Post()
  @CreateBaseResponse()
  async handle(
    @Body(new ZodValidationPipe(createBaseBodySchema))
    body: CreateBaseDto,
  ): Promise<{
    message: string;
    base: ReturnType<typeof BasePresenter.toHttp>;
  }> {
    const { name, companyId } = body;
    const result = await this.createBase.execute({
      name,
      companyId,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }
    return {
      message: "Base created successfully",
      base: BasePresenter.toHttp(result.value.base),
    };
  }
}
