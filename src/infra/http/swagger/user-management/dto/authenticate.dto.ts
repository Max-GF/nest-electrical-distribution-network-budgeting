import { ApiProperty } from "@nestjs/swagger";

export class AuthenticateUserDto {
  @ApiProperty({
    description: "Email of the user",
    example: "user@example.com",
    type: "string",
    required: false,
  })
  email?: string;
  @ApiProperty({
    description: "CPF of the user",
    example: "12345678901",
    type: "string",
    required: false,
  })
  cpf?: string;
  @ApiProperty({
    description: "Password of the user",
    example: "password123",
    type: "string",
    required: true,
  })
  password!: string;
}
