import { ApiProperty } from "@nestjs/swagger";

export class CreateCompanyDto {
  @ApiProperty({
    description: "Company name",
    example: "Company 123",
    type: "string",
    minLength: 6,
    maxLength: 100,
    required: true,
  })
  name!: string;
  @ApiProperty({
    description: "Company CNPJ",
    example: "00.000.000/0001-91 | 00000000000191 | 191",
    type: "string",
    required: true,
  })
  cnpj!: string;
}
