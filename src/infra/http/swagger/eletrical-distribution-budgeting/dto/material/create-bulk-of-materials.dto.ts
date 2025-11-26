import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsArray, ValidateNested } from "class-validator";
import { CreateMaterialDto } from "./create-material.dto";

export class CreateBulkOfMaterialsDto {
  @ApiProperty({
    description: "The list of materials to create",
    type: [CreateMaterialDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMaterialDto)
  materials!: CreateMaterialDto[];
}
