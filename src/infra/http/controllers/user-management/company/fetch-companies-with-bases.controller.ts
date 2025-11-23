import { Controller, Get, NotFoundException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FetchCompaniesWithBasesUseCase } from "src/domain/user-management/application/use-cases/company/fetch-companies-with-bases";
import { FetchCompaniesWithBasesResponse } from "src/infra/http/swagger/user-management/responses/fetch-companies-with-bases.response";
import { CompanyPresenter } from "../../../presenters/user-management/company-presenter";

@ApiTags("Company")
@Controller("/companies-with-bases")
export class FetchCompaniesWithBasesController {
  constructor(
    private fetchCompaniesWithBases: FetchCompaniesWithBasesUseCase,
  ) {}
  @Get()
  @FetchCompaniesWithBasesResponse()
  async handle(): Promise<{
    message: string;
    companies: ReturnType<typeof CompanyPresenter.toHttpWithBases>[];
  }> {
    const result = await this.fetchCompaniesWithBases.execute();
    if (result.isLeft() || result.value.companies.length === 0) {
      throw new NotFoundException("No companies was found");
    }
    return {
      message: "Companies fetched successfully",
      companies: result.value.companies.map(CompanyPresenter.toHttpWithBases),
    };
  }
}
