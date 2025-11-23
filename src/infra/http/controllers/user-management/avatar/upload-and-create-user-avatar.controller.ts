import {
  Body,
  Controller,
  FileTypeValidator,
  InternalServerErrorException,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UnsupportedMediaTypeException,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { InvalidAvatarTypeError } from "src/core/errors/errors-user-management/invalid-avatar-type";
import { UploadAndCreateUserAvatarUseCase } from "src/domain/user-management/application/use-cases/avatar/upload-and-create-user-avatar";
import { AvatarPresenter } from "../../../presenters/user-management/avatar-presenter";
import { UploadAndCreateUserAvatarDto } from "../../../swagger/user-management/dto/upload-and-create-user-avatar.dto";
import { UploadAndCreateUserAvatarResponse } from "../../../swagger/user-management/responses/upload-and-create-user-avatar.response";

@ApiTags("Upload and Download User Avatar")
@Controller("/avatars")
export class UploadAndCreateUserAvatarController {
  constructor(
    private uploadAndCreateUserAvatar: UploadAndCreateUserAvatarUseCase,
  ) {}
  @Post()
  @UploadAndCreateUserAvatarResponse()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  async handle(
    @Body() body: UploadAndCreateUserAvatarDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: 1024 * 1024 * 2, // 2mb
          }),
          new FileTypeValidator({
            fileType: ".(png|jpg|jpeg|pdf)",
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ userAvatar: ReturnType<typeof AvatarPresenter.toHttp> }> {
    const result = await this.uploadAndCreateUserAvatar.execute({
      fileName: file.originalname,
      fileType: file.mimetype,
      body: file.buffer,
    });
    if (result.isLeft()) {
      const error = result.value;

      switch (error.constructor) {
        case InvalidAvatarTypeError:
          throw new UnsupportedMediaTypeException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }
    return {
      userAvatar: AvatarPresenter.toHttp(result.value.userAvatar),
    };
  }
}
