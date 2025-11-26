import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString } from "class-validator";

export class EditMaterialDto {
  @ApiPropertyOptional({
    description: "The description of the material",
    example: "Material Description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "The unit of the material",
    example: "UN",
  })
  @IsString()
  @IsOptional()
  unit?: string;

  @ApiPropertyOptional({
    description: "The tension of the material",
    example: "MT",
  })
  @IsString()
  @IsOptional()
  tension?: string;
}
