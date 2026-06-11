import { BadRequestException, Controller, Get, Query } from "@nestjs/common";
import { FetchProjectsUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/fetch-projects";
import { z } from "zod";
import { ZodValidationPipe } from "../../../pipes/zod-validation-pipe";
import { ProjectPresenter } from "../../../presenters/eletrical-distribution-budgeting/project-presenter";
import { FetchProjectsDto } from "../../../swagger/eletrical-distribution-budgeting/dto/project/fetch-projects.dto";
import { FetchProjectsResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/project/fetch-projects.response";

const fetchProjectsQuerySchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  budgetAlreadyCalculated: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === "true")),
  calculatedDateBefore: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  calculatedDateAfter: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined)),
  page: z.coerce.number().min(1).optional().default(1),
  pageSize: z.coerce.number().min(1).optional().default(40),
});

@Controller("/projects")
export class FetchProjectsController {
  constructor(private fetchProjectsUseCase: FetchProjectsUseCase) {}

  @Get()
  @FetchProjectsResponse()
  async handle(
    @Query(new ZodValidationPipe(fetchProjectsQuerySchema))
    query: FetchProjectsDto,
  ) {
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

    const { projects, pagination } = result.value;

    return {
      projects: projects.map(ProjectPresenter.toHttp),
      pagination,
    };
  }
}
