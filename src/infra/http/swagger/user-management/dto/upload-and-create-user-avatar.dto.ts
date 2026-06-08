import { ApiProperty } from "@nestjs/swagger";

export class UploadAndCreateUserAvatarDto {
  @ApiProperty({
    description: "Image Datas",
    type: "string",
    format: "binary",
  })
  file!: Express.Multer.File;
}
