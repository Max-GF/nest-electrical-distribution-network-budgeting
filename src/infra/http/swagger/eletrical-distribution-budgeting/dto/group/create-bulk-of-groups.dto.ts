import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { CreateGroupDto } from "./create-group.dto";

export class CreateBulkOfGroupsDto {
  @ApiProperty({
    description: "The list of groups to create",
    type: [CreateGroupDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGroupDto)
  groups!: CreateGroupDto[];
}
