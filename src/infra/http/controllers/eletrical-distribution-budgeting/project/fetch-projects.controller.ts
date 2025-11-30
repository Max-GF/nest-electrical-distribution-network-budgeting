import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchProjectsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/fetch-projects";
import { ProjectPresenter } from "../../../presenters/eletrical-distribution-budgeting/project-presenter";
import { FetchProjectsDto } from "../../../swagger/eletrical-distribution-budgeting/dto/project/fetch-projects.dto";
import { FetchProjectsResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/project/fetch-projects.response";

@Controller("/projects")
export class FetchProjectsController {
  constructor(private fetchProjectsUseCase: FetchProjectsUseCase) {}

  @Get()
  @FetchProjectsResponse()
  async handle(@Query() query: FetchProjectsDto) {
    const {
      name,
      description,
      budgetAlreadyCalculated,
      calculatedDateBefore,
      calculatedDateAfter,
      page,
      pageSize,
    } = query;

    const result = await this.fetchProjectsUseCase.execute({
      name,
      description,
      budgetAlreadyCalculated,
      calculatedDateOptions:
        calculatedDateBefore || calculatedDateAfter
          ? {
              before: calculatedDateBefore,
              after: calculatedDateAfter,
            }
          : undefined,
      page,
      pageSize,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    const { projects } = result.value;

    return projects.map(ProjectPresenter.toHttp);
  }
}
