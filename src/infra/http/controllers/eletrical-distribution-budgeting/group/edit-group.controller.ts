import {
  BadRequestException,
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ResourceNotFoundError } from "src/core/errors/generics/resource-not-found-error";
import { EditGroupUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/edit-group";
import { JwtAuthGuard } from "src/infra/auth/jwt-auth.guard";
import { z } from "zod";
import { ZodValidationPipe } from "../../../pipes/zod-validation-pipe";
import { GroupPresenter } from "../../../presenters/eletrical-distribution-budgeting/group-presenter";
import { CreateGroupResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/group/create-group.response";

const editGroupItemSchema = z.object({
  groupItemId: z.string().uuid().optional(),
  quantity: z.number().optional(),
  addByPhase: z.number().optional(),
  description: z.string().optional(),
  type: z.enum(["material", "poleScrew", "cableConnector"]).optional(),
  materialId: z.string().uuid().optional(),
  lengthAdd: z.number().optional(),
  localCableSectionInMM: z.number().optional(),
});

const editGroupSchema = z.object({
  name: z.string().optional(),
  tension: z.string().optional(),
  description: z.string().optional(),
  items: z.array(editGroupItemSchema).optional(),
});

type EditGroupSchema = z.infer<typeof editGroupSchema>;

@ApiTags("Groups")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("/groups/:id")
export class EditGroupController {
  constructor(private editGroup: EditGroupUseCase) {}

  @Put()
  @ApiOperation({ summary: "Edit a group" })
  @ApiResponse({
    status: 200,
    description: "The group has been successfully edited.",
    type: CreateGroupResponse,
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 404, description: "Not Found" })
  async handle(
    @Param("id") id: string,
    @Body(new ZodValidationPipe(editGroupSchema)) body: EditGroupSchema,
  ) {
    const { name, description, tension, items } = body;

    const result = await this.editGroup.execute({
      groupToEditId: id,
      name,
      description,
      tension,
      items: items?.map((item) => {
        if (item.type === "material") {
          return {
            type: "material",
            groupItemId: item.groupItemId,
            quantity: item.quantity ?? 0,
            addByPhase: item.addByPhase,
            description: item.description,
            materialId: item.materialId ?? "",
          };
        } else if (item.type === "poleScrew") {
          return {
            type: "poleScrew",
            groupItemId: item.groupItemId,
            quantity: item.quantity ?? 0,
            addByPhase: item.addByPhase,
            description: item.description,
            lengthAdd: item.lengthAdd ?? 0,
          };
        } else {
          return {
            type: "cableConnector",
            groupItemId: item.groupItemId,
            quantity: item.quantity ?? 0,
            addByPhase: item.addByPhase,
            description: item.description,
            localCableSectionInMM: item.localCableSectionInMM ?? 0,
          };
        }
      }),
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof ResourceNotFoundError) {
        throw new NotFoundException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    const { group } = result.value;

    return {
      group: GroupPresenter.toHttp(group),
    };
  }
}
