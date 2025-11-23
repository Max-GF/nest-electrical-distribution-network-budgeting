import { ApiProperty } from "@nestjs/swagger";

export class EditCompanyDto {
  @ApiProperty({
    description: "New company name",
    example: "Company 123",
    type: "string",
    maxLength: 100,
    required: false,
  })
  name?: string;
  @ApiProperty({
    description: "New company cnpj",
    example: "12.345.678/0001-90",
    type: "string",
    required: false,
  })
  cnpj?: string;
}
