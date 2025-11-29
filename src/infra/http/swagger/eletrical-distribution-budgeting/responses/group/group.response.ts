import { ApiProperty } from "@nestjs/swagger";

export class GroupResponse {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  id!: string;

  @ApiProperty({ example: "ESTRUTURA N1" })
  name!: string;

  @ApiProperty({ example: "Estrutura de passagem" })
  description!: string;

  @ApiProperty({ example: "MT" })
  tension!: string;
}
