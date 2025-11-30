import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional, IsString } from "class-validator";

export class EditProjectDto {
  @ApiProperty({ example: "Project Alpha", required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: "Description of Project Alpha", required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: false, required: false })
  @IsBoolean()
  @IsOptional()
  budgetAlreadyCalculated?: boolean;
}
