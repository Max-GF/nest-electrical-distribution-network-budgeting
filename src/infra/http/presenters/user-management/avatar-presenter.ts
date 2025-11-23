import { UserAvatar } from "src/domain/user-management/enterprise/entities/user-avatar";

export class AvatarPresenter {
  static toHttp(userAvatar: UserAvatar) {
    return {
      id: userAvatar.id.toString(),
      title: userAvatar.title,
      url: userAvatar.url,
    };
  }
}
