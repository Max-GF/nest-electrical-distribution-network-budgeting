import { Controller, Get, NotFoundException, Param } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { FetchBasesByCompanyIdUseCase } from "src/domain/user-management/application/use-cases/base/fetch-bases-by-company-id";
import { BasePresenter } from "../../../presenters/user-management/base-presenter";
import { FetchBasesByCompanyIdResponse } from "../../../swagger/user-management/responses/fetch-bases-by-company-id.response";

@ApiTags("Base")
@Controller("/bases/:companyId")
export class FetchBasesByCompanyIdController {
  constructor(private fetchBasesByCompanyId: FetchBasesByCompanyIdUseCase) {}
  @Get()
  @FetchBasesByCompanyIdResponse()
  async handle(@Param("companyId") companyId: string): Promise<{
    message: string;
    bases: ReturnType<typeof BasePresenter.toHttp>[];
  }> {
    const result = await this.fetchBasesByCompanyId.execute({
      companyId,
    });
    if (result.isLeft() || result.value.bases.length === 0) {
      throw new NotFoundException("No bases was found for this company");
    }
    return {
      message: "Bases fetched successfully",
      bases: result.value.bases.map(BasePresenter.toHttp),
    };
  }
}
