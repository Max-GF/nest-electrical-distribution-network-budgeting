import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNotEmpty, IsString } from "class-validator";

export class CreateProjectDto {
  @ApiProperty({ example: "Project Alpha" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "Description of Project Alpha" })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ example: false })
  @IsBoolean()
  budgetAlreadyCalculated!: boolean;
}
