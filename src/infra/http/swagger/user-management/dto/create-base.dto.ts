import { ApiProperty } from "@nestjs/swagger";

export class CreateBaseDto {
  @ApiProperty({
    description: "Base name",
    example: "Base 123",
    type: "string",
    minLength: 6,
    maxLength: 100,
    required: true,
  })
  name!: string;
  @ApiProperty({
    description: "Company ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: "string",
    required: true,
  })
  companyId!: string;
}
