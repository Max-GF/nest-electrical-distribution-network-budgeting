import { Avatar as PrismaUserAvatar } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { UserAvatar as DomainUserAvatar } from "src/domain/user-management/enterprise/entities/user-avatar";

export class PrismaUserAvatarMapper {
  static toDomain(raw: PrismaUserAvatar): DomainUserAvatar {
    return DomainUserAvatar.create(
      {
        title: raw.title,
        url: raw.url,
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toPrisma(raw: DomainUserAvatar): PrismaUserAvatar {
    return {
      id: raw.id.toString(),
      title: raw.title,
      url: raw.url,
    };
  }
}
