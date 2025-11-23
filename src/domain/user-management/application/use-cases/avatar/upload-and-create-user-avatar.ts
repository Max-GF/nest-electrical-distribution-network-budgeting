import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { InvalidAvatarTypeError } from "src/core/errors/errors-user-management/invalid-avatar-type";
import { UserAvatar } from "../../../enterprise/entities/user-avatar";
import { AvatarsRepository } from "../../repositories/avatars-repository";
import { Uploader } from "../../storage/uploader";

interface UploadAndCreateUserAvatarUseCaseRequest {
  fileName: string;
  fileType: string;
  body: Buffer;
}

type UploadAndCreateUserAvatarUseCaseResponse = Either<
  InvalidAvatarTypeError,
  {
    userAvatar: UserAvatar;
  }
>;

@Injectable()
export class UploadAndCreateUserAvatarUseCase {
  constructor(
    private avatarsRepository: AvatarsRepository,
    private uploader: Uploader,
  ) {}

  async execute({
    fileName,
    fileType,
    body,
  }: UploadAndCreateUserAvatarUseCaseRequest): Promise<UploadAndCreateUserAvatarUseCaseResponse> {
    if (!this.isFileTypeValid(fileType)) {
      return left(new InvalidAvatarTypeError("Invalid file type"));
    }
    const { url } = await this.uploader.upload({
      fileName,
      fileType,
      body,
    });
    const userAvatar = UserAvatar.create({
      title: fileName,
      url,
    });
    await this.avatarsRepository.createMany([userAvatar]);
    return right({
      userAvatar,
    });
  }

  isFileTypeValid(fileType: string): boolean {
    return /^(image\/(jpeg|png))$|^application\/pdf$/.test(fileType);
  }
}
