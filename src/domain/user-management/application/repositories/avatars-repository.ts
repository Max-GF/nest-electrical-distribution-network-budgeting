import { UserAvatar } from "../../enterprise/entities/user-avatar";

export abstract class AvatarsRepository {
  abstract createMany(avatars: UserAvatar[]): Promise<void>;
  abstract findById(id: string): Promise<UserAvatar | null>;
  abstract deleteById(id: string): Promise<void>;
}
