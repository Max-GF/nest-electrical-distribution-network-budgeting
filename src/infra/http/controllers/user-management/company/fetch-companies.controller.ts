import { Controller, Get, NotFoundException } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FetchCompaniesUseCase } from "src/domain/user-management/application/use-cases/company/fetch-companies";
import { CompanyPresenter } from "../../../presenters/user-management/company-presenter";
import { FetchCompaniesResponse } from "../../../swagger/user-management/responses/fetch-companies.response";

@ApiTags("Company")
@Controller("/companies")
export class FetchCompaniesController {
  constructor(private fetchCompanies: FetchCompaniesUseCase) {}
  @Get()
  @FetchCompaniesResponse()
  async handle(): Promise<{
    message: string;
    companies: ReturnType<typeof CompanyPresenter.toHttp>[];
  }> {
    const result = await this.fetchCompanies.execute();
    if (result.isLeft() || result.value.companies.length === 0) {
      throw new NotFoundException("No companies was found");
    }
    return {
      message: "Companies fetched successfully",
      companies: result.value.companies.map(CompanyPresenter.toHttp),
    };
  }
}
