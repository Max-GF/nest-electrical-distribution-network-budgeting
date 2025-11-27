import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsArray,
    IsNumber,
    IsOptional,
    IsString,
    IsUUID,
    ValidateNested,
} from "class-validator";

export class EditGroupItemDto {
  @ApiPropertyOptional({
    description: "The id of the group item",
    example: "uuid",
  })
  @IsUUID()
  @IsOptional()
  groupItemId?: string;

  @ApiPropertyOptional({
    description: "The quantity of the item",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  quantity?: number;

  @ApiPropertyOptional({
    description: "The add by phase of the item",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  addByPhase?: number;

  @ApiPropertyOptional({
    description: "The description of the item",
    example: "Item Description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "The type of the item",
    example: "material",
    enum: ["material", "poleScrew", "cableConnector"],
  })
  @IsString()
  @IsOptional()
  type?: "material" | "poleScrew" | "cableConnector";

  @ApiPropertyOptional({
    description: "The material id of the item",
    example: "uuid",
  })
  @IsUUID()
  @IsOptional()
  materialId?: string;

  @ApiPropertyOptional({
    description: "The length add of the item",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  lengthAdd?: number;

  @ApiPropertyOptional({
    description: "The local cable section in mm of the item",
    example: 1,
  })
  @IsNumber()
  @IsOptional()
  localCableSectionInMM?: number;
}

export class EditGroupDto {
  @ApiPropertyOptional({
    description: "The name of the group",
    example: "Group Name",
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({
    description: "The tension of the group",
    example: "MT",
  })
  @IsString()
  @IsOptional()
  tension?: string;

  @ApiPropertyOptional({
    description: "The description of the group",
    example: "Group Description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "The items of the group",
    type: [EditGroupItemDto],
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EditGroupItemDto)
  items?: EditGroupItemDto[];
}
