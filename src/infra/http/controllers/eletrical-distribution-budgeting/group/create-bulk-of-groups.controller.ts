import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { CreateBulkOfGroupUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/create-bulk-of-groups";
import { JwtAuthGuard } from "src/infra/auth/jwt-auth.guard";
import { GroupPresenter } from "../../../presenters/eletrical-distribution-budgeting/group-presenter";
import { CreateBulkOfGroupsDto } from "../../../swagger/eletrical-distribution-budgeting/dto/group/create-bulk-of-groups.dto";
import { GroupResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/group/group.response";

@ApiTags("Groups")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("/groups/bulk")
export class CreateBulkOfGroupsController {
  constructor(private createBulkOfGroups: CreateBulkOfGroupUseCase) {}

  @Post()
  @ApiOperation({ summary: "Create multiple groups" })
  @ApiResponse({
    status: 201,
    description: "The groups have been successfully created.",
    type: [GroupResponse],
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 409, description: "Conflict" })
  async handle(@Body() body: CreateBulkOfGroupsDto) {
    const { groups } = body;

    const result = await this.createBulkOfGroups.execute({
      groups: groups.map((group) => ({
        name: group.name,
        description: group.description,
        tension: group.tension,
        items: group.items.map((item) => {
          if (item.type === "material") {
            return {
              type: "material",
              quantity: item.quantity,
              addByPhase: item.addByPhase,
              description: item.description,
              materialId: item.materialId ?? "",
            };
          } else if (item.type === "poleScrew") {
            return {
              type: "poleScrew",
              quantity: item.quantity,
              addByPhase: item.addByPhase,
              description: item.description,
              lengthAdd: item.lengthAdd ?? 0,
            };
          } else {
            return {
              type: "cableConnector",
              quantity: item.quantity,
              addByPhase: item.addByPhase,
              description: item.description,
              localCableSectionInMM: item.localCableSectionInMM ?? 0,
            };
          }
        }),
      })),
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof AlreadyRegisteredError) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    const { groups: createdGroups } = result.value;

    return {
      groups: createdGroups.map(GroupPresenter.toHttp),
    };
  }
}
