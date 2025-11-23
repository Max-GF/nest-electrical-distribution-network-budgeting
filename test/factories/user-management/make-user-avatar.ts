import { faker } from "@faker-js/faker";
import { Injectable } from "@nestjs/common";
import { readFileSync } from "node:fs";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import {
  UserAvatar,
  UserAvatarProps,
} from "src/domain/user-management/enterprise/entities/user-avatar";
import { PrismaUserAvatarMapper } from "src/infra/database/prisma/mappers/user-management/prisma-user-avatar-mapper";
import { PrismaService } from "src/infra/database/prisma/prisma.service";
import { R2Storage } from "src/infra/storage/r2-storage";

export function makeUserAvatar(
  override: Partial<UserAvatarProps> = {},
  id?: UniqueEntityID,
) {
  const userAvatar = UserAvatar.create(
    {
      title: faker.lorem.words(2),
      url: faker.image.url(),
      ...override,
    },
    id,
  );

  return userAvatar;
}

@Injectable()
export class UserAvatarFactory {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Storage: R2Storage,
  ) {}

  async makePrismaUserAvatar(
    data: Partial<UserAvatarProps> = {},
  ): Promise<UserAvatar> {
    const userAvatar = makeUserAvatar(data);
    const imageContent = readFileSync("test/e2e/sample-upload.jpg");
    const r2FileResponse = await this.r2Storage.upload({
      fileName: userAvatar.title,
      fileType: "image/jpeg",
      body: Buffer.from(imageContent),
    });

    userAvatar.url = r2FileResponse.url;
    await this.prisma.avatar.create({
      data: PrismaUserAvatarMapper.toPrisma(userAvatar),
    });
    return userAvatar;
  }
}
