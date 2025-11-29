import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from "class-validator";

export class GroupItemDto {
  @ApiProperty({
    description: "The quantity of the item",
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  quantity!: number;

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

  @ApiProperty({
    description: "The type of the item",
    example: "material",
    enum: ["material", "poleScrew", "cableConnector"],
  })
  @IsString()
  @IsNotEmpty()
  type!: "material" | "poleScrew" | "cableConnector";

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

export class CreateGroupDto {
  @ApiProperty({
    description: "The name of the group",
    example: "Group Name",
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: "The tension of the group",
    example: "MT",
  })
  @IsString()
  @IsNotEmpty()
  tension!: string;

  @ApiProperty({
    description: "The description of the group",
    example: "Group Description",
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: "The items of the group",
    type: [GroupItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupItemDto)
  items!: GroupItemDto[];
}
