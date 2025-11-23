import {
  Body,
  ConflictException,
  Controller,
  InternalServerErrorException,
  Post,
  UnprocessableEntityException,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/errors-user-management/already-registered-error";
import { NotAllowedError } from "src/core/errors/errors-user-management/not-allowed-error";
import { CreateCompanyUseCase } from "src/domain/user-management/application/use-cases/company/create-company";
import { ZodValidationPipe } from "src/infra/http/pipes/zod-validation-pipe";
import { z } from "zod";
import { CompanyPresenter } from "../../../presenters/user-management/company-presenter";
import { CreateCompanyDto } from "../../../swagger/user-management/dto/create-company.dto";
import { CreateCompanyResponse } from "../../../swagger/user-management/responses/create-company.response";

const createCompanyBodySchema = z.object({
  name: z.string().min(6).max(100).toUpperCase(),
  cnpj: z.string(),
});

@ApiTags("Company")
@Controller("/companies")
export class CreateCompanyController {
  constructor(private createCompany: CreateCompanyUseCase) {}
  @Post()
  @CreateCompanyResponse()
  async handle(
    @Body(new ZodValidationPipe(createCompanyBodySchema))
    body: CreateCompanyDto,
  ): Promise<{
    message: string;
    company: ReturnType<typeof CompanyPresenter.toHttp>;
  }> {
    const { name, cnpj } = body;
    const result = await this.createCompany.execute({
      name,
      cnpj,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case NotAllowedError:
          throw new UnprocessableEntityException(error.message);
        case AlreadyRegisteredError:
          throw new ConflictException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }
    return {
      message: "Company created successfully",
      company: CompanyPresenter.toHttp(result.value.company),
    };
  }
}
