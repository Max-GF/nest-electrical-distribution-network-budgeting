import { ApiProperty } from "@nestjs/swagger";

export class EditBaseDto {
  @ApiProperty({
    description: "New base name",
    example: "Base 123",
    type: "string",
    maxLength: 100,
    required: true,
  })
  name!: string;
}
