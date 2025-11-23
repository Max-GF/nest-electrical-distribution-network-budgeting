import { ApiProperty } from "@nestjs/swagger";

export class RefreshAccessTokenDto {
  @ApiProperty({
    description: "Current refresh token of the user",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    type: "string",
    required: true,
  })
  refreshToken!: string;
}
