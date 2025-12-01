import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { AlreadyRegisteredError } from "src/core/errors/generics/already-registered-error";
import { CreateGroupUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/create-group";
import { JwtAuthGuard } from "src/infra/auth/jwt-auth.guard";
import { z } from "zod";
import { ZodValidationPipe } from "../../../pipes/zod-validation-pipe";
import { GroupPresenter } from "../../../presenters/eletrical-distribution-budgeting/group-presenter";
import { CreateGroupResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/group/create-group.response";

const createGroupItemSchema = z.object({
  quantity: z.number(),
  addByPhase: z.number().optional(),
  description: z.string().optional(),
  type: z.enum(["material", "poleScrew", "cableConnector"]),
  materialId: z.string().uuid().optional(),
  lengthAdd: z.number().optional(),
  localCableSectionInMM: z.number().optional(),
});

const createGroupSchema = z.object({
  name: z.string().min(1),
  tension: z.string().min(1),
  description: z.string().min(1),
  items: z.array(createGroupItemSchema),
});

type CreateGroupSchema = z.infer<typeof createGroupSchema>;

@ApiTags("Groups")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("/groups")
export class CreateGroupController {
  constructor(private createGroup: CreateGroupUseCase) {}

  @Post()
  @ApiOperation({ summary: "Create a new group" })
  @ApiResponse({
    status: 201,
    description: "The group has been successfully created.",
    type: CreateGroupResponse,
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  @ApiResponse({ status: 409, description: "Conflict" })
  @UsePipes(new ZodValidationPipe(createGroupSchema))
  async handle(@Body() body: CreateGroupSchema) {
    const { name, description, tension, items } = body;

    const result = await this.createGroup.execute({
      name,
      description,
      tension,
      items: items.map((item) => {
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
    });

    if (result.isLeft()) {
      const error = result.value;
      if (error instanceof AlreadyRegisteredError) {
        throw new ConflictException(error.message);
      }
      throw new BadRequestException(error.message);
    }

    const { group } = result.value;

    return {
      group: GroupPresenter.toHttp(group),
    };
  }
}
