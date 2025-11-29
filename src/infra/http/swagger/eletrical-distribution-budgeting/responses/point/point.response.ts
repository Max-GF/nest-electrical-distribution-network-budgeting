import { ApiProperty } from "@nestjs/swagger";

export class PointResponse {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "P1" })
  name!: string;

  @ApiProperty({ example: "Point Description", required: false })
  description?: string;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  projectId!: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  mediumTensionEntranceCableId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  mediumTensionExitCableId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  lowTensionEntranceCableId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  lowTensionExitCableId?: string;

  @ApiProperty({
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  utilityPoleId?: string;
}
