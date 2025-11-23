import { AggregateRoot } from "src/core/entities/aggregate-root";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Optional } from "src/core/types/optional";
import { UserCreatedEvent } from "../events/user-created-event";
import { Cpf } from "./value-objects/cpf";
import { UserRole } from "./value-objects/user-roles";

export interface UserProps {
  cpf: Cpf;

  name: string;
  email: string;
  password: string;
  role: UserRole;

  baseId: UniqueEntityID;
  companyId: UniqueEntityID;

  isActive: boolean;
  firstLogin: boolean;

  avatarId?: UniqueEntityID | null;
}

export class User extends AggregateRoot<UserProps> {
  static create(
    props: Optional<UserProps, "firstLogin" | "isActive">,
    id?: UniqueEntityID,
  ) {
    const user = new User(
      {
        ...props,
        firstLogin: props.firstLogin ?? true,
        isActive: props.isActive ?? true,
      },
      id,
    );
    const isNewUser = !id;
    if (isNewUser) {
      user.addDomainEvent(new UserCreatedEvent(user));
    }

    return user;
  }
  get cpf(): Cpf {
    return this.props.cpf;
  }

  get name(): string {
    return this.props.name;
  }
  set name(name: string) {
    this.props.name = name;
  }
  get email(): string {
    return this.props.email;
  }
  set email(email: string) {
    this.props.email = email;
  }
  get password(): string {
    return this.props.password;
  }
  set password(password: string) {
    this.props.password = password;
  }
  get role(): UserRole {
    return this.props.role;
  }
  set role(role: UserRole) {
    this.props.role = role;
  }
  get baseId(): UniqueEntityID {
    return this.props.baseId;
  }
  set baseId(baseId: UniqueEntityID) {
    this.props.baseId = baseId;
  }
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }
  set companyId(companyId: UniqueEntityID) {
    this.props.companyId = companyId;
  }
  get isActive(): boolean {
    return this.props.isActive;
  }
  set isActive(isActive: boolean) {
    this.props.isActive = isActive;
  }
  get firstLogin(): boolean {
    return this.props.firstLogin;
  }
  set firstLogin(firstLogin: boolean) {
    this.props.firstLogin = firstLogin;
  }
  get avatarId(): UniqueEntityID | undefined | null {
    return this.props.avatarId;
  }
  set avatarId(avatarId: UniqueEntityID | undefined | null) {
    this.props.avatarId = avatarId;
  }
}
