import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsString, IsUUID } from "class-validator";

export class EditPointDto {
  @ApiPropertyOptional({
    description: "The description of the point",
    example: "Point Description",
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: "The medium tension entrance cable id",
    example: "uuid",
  })
  @IsUUID()
  @IsOptional()
  mediumTensionEntranceCableId?: string;

  @ApiPropertyOptional({
    description: "The medium tension exit cable id",
    example: "uuid",
  })
  @IsUUID()
  @IsOptional()
  mediumTensionExitCableId?: string;

  @ApiPropertyOptional({
    description: "The low tension entrance cable id",
    example: "uuid",
  })
  @IsUUID()
  @IsOptional()
  lowTensionEntranceCableId?: string;

  @ApiPropertyOptional({
    description: "The low tension exit cable id",
    example: "uuid",
  })
  @IsUUID()
  @IsOptional()
  lowTensionExitCableId?: string;

  @ApiPropertyOptional({
    description: "The utility pole id",
    example: "uuid",
  })
  @IsUUID()
  @IsOptional()
  utilityPoleId?: string;
}
