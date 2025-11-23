import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Res,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { DownloadUserAvatarByIdUseCase } from "src/domain/user-management/application/use-cases/avatar/download-user-avatar";

@ApiTags("Upload and Download User Avatar")
@Controller("/avatars/:id")
export class DownloadUserAvatarByIdController {
  constructor(private downloadUserAvatarById: DownloadUserAvatarByIdUseCase) {}

  @Get()
  @UseInterceptors(FileInterceptor("file"))
  async handle(@Param("id") id: string, @Res() res: Response) {
    const result = await this.downloadUserAvatarById.execute({
      avatarId: id,
    });

    if (result.isLeft()) {
      const error = result.value;
      switch (error.constructor) {
        case ResourceNotFoundError:
          throw new NotFoundException(error.message);
        default:
          throw new InternalServerErrorException(error.message);
      }
    }

    const { file } = result.value;

    res.setHeader("Content-Type", file.fileType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.fileName}"`,
    );

    return res.send(file.body);
  }
}
