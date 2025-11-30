import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
} from "@nestjs/common";
import { CreateProjectUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/create-project";
import { ProjectPresenter } from "../../../presenters/eletrical-distribution-budgeting/project-presenter";
import { CreateProjectDto } from "../../../swagger/eletrical-distribution-budgeting/dto/project/create-project.dto";
import { CreateProjectResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/project/create-project.response";

@Controller("/projects")
export class CreateProjectController {
  constructor(private createProjectUseCase: CreateProjectUseCase) {}

  @Post()
  @CreateProjectResponse()
  async handle(@Body() body: CreateProjectDto) {
    const { name, description, budgetAlreadyCalculated } = body;

    const result = await this.createProjectUseCase.execute({
      name,
      description,
      budgetAlreadyCalculated,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor.name) {
        case "AlreadyRegisteredError":
          throw new ConflictException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { project } = result.value;

    return ProjectPresenter.toHttp(project);
  }
}
