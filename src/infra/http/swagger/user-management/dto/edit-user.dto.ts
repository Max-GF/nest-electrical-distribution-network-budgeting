import { ApiProperty } from "@nestjs/swagger";

export class EditUserDto {
  @ApiProperty({
    description: "User's Name",
    example: "Example Name",
    type: "string",
    required: false,
  })
  name?: string;
  @ApiProperty({
    description: "User's Email",
    example: "example@email.com",
    type: "string",
    required: false,
  })
  email?: string;
  @ApiProperty({
    description: "User's Password",
    example: "123456",
    type: "string",
    minLength: 6,
    required: false,
  })
  password?: string;
  @ApiProperty({
    description: "User's Role",
    example: "ADMIN/COMMON",
    type: "string",
    required: false,
  })
  role?: string;
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
    description: "If user is active",
    example: true,
    type: "boolean",
    required: false,
  })
  isActive?: boolean;
  @ApiProperty({
    description: "Avatar ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
    type: "string",
    required: false,
    nullable: true,
  })
  avatarId?: string;
}
