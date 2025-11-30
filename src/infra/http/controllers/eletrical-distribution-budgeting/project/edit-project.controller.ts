import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
} from "@nestjs/common";
import { EditProjectUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/project/edit-project";
import { ProjectPresenter } from "../../../presenters/eletrical-distribution-budgeting/project-presenter";
import { EditProjectDto } from "../../../swagger/eletrical-distribution-budgeting/dto/project/edit-project.dto";
import { EditProjectResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/project/edit-project.response";

@Controller("/projects/:id")
export class EditProjectController {
  constructor(private editProjectUseCase: EditProjectUseCase) {}

  @Put()
  @EditProjectResponse()
  async handle(@Param("id") id: string, @Body() body: EditProjectDto) {
    const { name, description, budgetAlreadyCalculated } = body;

    const result = await this.editProjectUseCase.execute({
      projectId: id,
      name,
      description,
      budgetAlreadyCalculated,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor.name) {
        case "AlreadyRegisteredError":
          throw new NotFoundException(error.message); // UseCase returns AlreadyRegisteredError for "Project not found" which is weird but I follow the use case logic or map it to NotFound
        case "NotAllowedError":
          throw new BadRequestException(error.message);
        default:
          throw new BadRequestException(error.message);
      }
    }

    const { project } = result.value;

    return ProjectPresenter.toHttp(project);
  }
}
