import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { FetchGroupUseCase } from "src/domain/eletrical-distribution-budgeting/application/use-cases/group/fetch-groups-with-filter-options";
import { JwtAuthGuard } from "src/infra/auth/jwt-auth.guard";
import { GroupPresenter } from "../../../presenters/eletrical-distribution-budgeting/group-presenter";
import { FetchGroupsWithFilterOptionsDto } from "../../../swagger/eletrical-distribution-budgeting/dto/group/fetch-groups-with-filter-options.dto";
import { FetchGroupsResponse } from "../../../swagger/eletrical-distribution-budgeting/responses/group/fetch-groups.response";

@ApiTags("Groups")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("/groups")
export class FetchGroupsController {
  constructor(private fetchGroups: FetchGroupUseCase) {}

  @Get()
  @ApiOperation({ summary: "Fetch groups with filters" })
  @ApiResponse({
    status: 200,
    description: "The groups have been successfully fetched.",
    type: FetchGroupsResponse,
  })
  @ApiResponse({ status: 400, description: "Bad Request" })
  async handle(@Query() query: FetchGroupsWithFilterOptionsDto) {
    const { name, description, tension, page, pageSize } = query;

    const result = await this.fetchGroups.execute({
      name,
      description,
      tension,
      page,
      pageSize,
    });

    if (result.isLeft()) {
      throw new BadRequestException(result.value.message);
    }

    const { groupWithDetailedItems, pagination } = result.value;

    return {
      groups: groupWithDetailedItems.map((item) =>
        GroupPresenter.toHttpWithItems(item.group, item.itemsWithDetails),
      ),
      pagination,
    };
  }
}
