import { ApiProperty } from "@nestjs/swagger";
import { GroupWithItemsResponse } from "./group-with-items.response";

class PaginationResponse {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 50 })
  totalItems!: number;

  @ApiProperty({ example: 5 })
  totalPages!: number;
}

export class FetchGroupsResponse {
  @ApiProperty({ type: [GroupWithItemsResponse] })
  groups!: GroupWithItemsResponse[];

  @ApiProperty({ type: PaginationResponse })
  pagination!: PaginationResponse;
}
