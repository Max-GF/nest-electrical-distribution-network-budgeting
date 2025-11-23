import { Injectable } from "@nestjs/common";
import { Either, left, right } from "src/core/either";
import { ResourceNotFoundError } from "src/core/errors/errors-user-management/resource-not-found-error";
import { UserAvatar } from "../../../enterprise/entities/user-avatar";
import { AvatarsRepository } from "../../repositories/avatars-repository";
import { Downloader, DownloadResponse } from "../../storage/downloader";

interface DownloadAvatarByIdRequest {
  avatarId: string;
}

type DownloadAvatarByIdResponse = Either<
  ResourceNotFoundError,
  { userAvatar: UserAvatar; file: DownloadResponse }
>;

@Injectable()
export class DownloadUserAvatarByIdUseCase {
  constructor(
    private avatarsRepository: AvatarsRepository,
    private downloader: Downloader,
  ) {}

  async execute({
    avatarId,
  }: DownloadAvatarByIdRequest): Promise<DownloadAvatarByIdResponse> {
    const avatar = await this.avatarsRepository.findById(avatarId);

    if (!avatar)
      return left(new ResourceNotFoundError("Avatar's id was not found"));

    const file = await this.downloader.download({
      url: avatar.url,
    });

    if (!file)
      return left(
        new ResourceNotFoundError("File was not found on the storage"),
      );

    return right({ userAvatar: avatar, file });
  }
}
