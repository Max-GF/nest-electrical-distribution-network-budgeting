import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  NotFoundException,
  Param,
  Put,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { EditCompanyUseCase } from "src/domain/user-management/application/use-cases/company/edit-company";
import { CurrentUser } from "src/infra/auth/current-user.decorator";
import { UserPayload } from "src/infra/auth/jwt-strategy";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { CompanyPresenter } from "src/infra/http/presenters/user-management/company-presenter";
import { EditCompanyDto } from "src/infra/http/swagger/user-management/dto/edit-company.dto";
import { EditCompanyResponse } from "src/infra/http/swagger/user-management/responses/edit-company.response";
import { z } from "zod";

const editCompanyBodySchema = z.object({
  name: z.string().max(100).toUpperCase().optional(),
  cnpj: z.string().optional(),
});

@ApiTags("Company")
@Controller("/companies/:id")
export class EditCompanyController {
  constructor(private editCompany: EditCompanyUseCase) {}
  @Put()
  @EditCompanyResponse()
  async handle(
    @Body(new ZodValidationPipe(editCompanyBodySchema))
    body: EditCompanyDto,
    @Param("id") companyId: string,

    @CurrentUser() user: UserPayload,
  ): Promise<{
    message: string;
    company: ReturnType<typeof CompanyPresenter.toHttp>;
  }> {
    const { name, cnpj } = body;
    const result = await this.editCompany.execute({
      actualUserCompanyId: user.companyId,
      companyId,
      name,
      cnpj,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        case NotAllowedError:
          if (
            error.message === "You cannot edit a company you don't belong to"
          ) {
            throw new ForbiddenException(error.message);
          } else {
            throw new UnprocessableEntityException(error.message);
          }
        default:
          throw new BadRequestException(error.message);
      }
    }
    return {
      message: "Company edited successfully",
      company: CompanyPresenter.toHttp(result.value.company),
    };
  }
}
