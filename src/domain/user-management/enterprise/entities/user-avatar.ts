import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface UserAvatarProps {
  title: string;
  url: string;
}

export class UserAvatar extends Entity<UserAvatarProps> {
  static create(props: UserAvatarProps, id?: UniqueEntityID) {
    const useravatar = new UserAvatar(props, id);
    return useravatar;
  }

  get title(): string {
    return this.props.title;
  }
  get url(): string {
    return this.props.url;
  }
  set url(url: string) {
    this.props.url = url;
  }
}
