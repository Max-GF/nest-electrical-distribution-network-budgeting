import { AvatarsRepository } from "src/domain/user-management/application/repositories/avatars-repository";
import { UserAvatar } from "src/domain/user-management/enterprise/entities/user-avatar";

export class InMemoryAvatarsRepository implements AvatarsRepository {
  public items: UserAvatar[] = [];
  async createMany(avatars: UserAvatar[]): Promise<void> {
    this.items.push(...avatars);
  }
  async findById(id: string): Promise<UserAvatar | null> {
    const foundedAvatar = this.items.find(
      (avatar) => avatar.id.toString() === id,
    );
    if (!foundedAvatar) return null;
    return foundedAvatar;
  }
  async deleteById(id: string): Promise<void> {
    const foundedAvatarIndex = this.items.findIndex(
      (avatar) => avatar.id.toString() === id,
    );
    if (foundedAvatarIndex < 0) return;
    this.items.splice(foundedAvatarIndex, 1);
  }
}
