import { ValueObject } from "src/core/entities/value-object";
import { Base } from "../base";
import { Company } from "../company";
import { UserAvatar } from "../user-avatar";

export interface UserWithDetailsProps {
  id: string;
  cpf: string;

  name: string;
  email: string;
  role: string;

  base: Base;
  company: Company;

  isActive: boolean;
  firstLogin: boolean;

  avatar?: UserAvatar | null;
}
export class UserWithDetails extends ValueObject<UserWithDetailsProps> {
  static create(props: UserWithDetailsProps): UserWithDetails {
    return new UserWithDetails(props);
  }

  get id(): string {
    return this.props.id;
  }

  get cpf(): string {
    return this.props.cpf;
  }

  get name(): string {
    return this.props.name;
  }

  get email(): string {
    return this.props.email;
  }

  get role(): string {
    return this.props.role;
  }

  get base(): Base {
    return this.props.base;
  }

  get company(): Company {
    return this.props.company;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get firstLogin(): boolean {
    return this.props.firstLogin;
  }

  get avatar(): UserAvatar | undefined | null {
    return this.props.avatar;
  }
}
