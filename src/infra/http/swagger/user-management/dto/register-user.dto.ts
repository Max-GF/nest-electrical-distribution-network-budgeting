import { ApiProperty } from "@nestjs/swagger";

export class RegisterUserDto {
  @ApiProperty({
    description: "User's Cpf",
    example: "12345678900",
    type: "string",
    required: true,
  })
  cpf!: string;
  @ApiProperty({
    description: "User's Name",
    example: "Example Name",
    type: "string",
    required: true,
  })
  name!: string;
  @ApiProperty({
    description: "User's Email",
    example: "example@email.com",
    type: "string",
    required: true,
  })
  email!: string;
  @ApiProperty({
    description: "User's Password",
    example: "123456",
    type: "string",
    minLength: 6,
    required: true,
  })
  password!: string;
  @ApiProperty({
    description: "User's Role",
    example: "ADMIN/COMMON",
    type: "string",
    required: true,
  })
  role!: string;
  @ApiProperty({
    description: "Base ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: "string",
    required: true,
  })
  baseId!: string;
  @ApiProperty({
    description: "Company ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: "string",
    required: true,
  })
  companyId!: string;
  @ApiProperty({
    description: "Avatar ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: "string",
    required: false,
  })
  avatarId?: string;
}
