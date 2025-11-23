import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface BaseProps {
  name: string;
  companyId: UniqueEntityID;
}

export class Base extends Entity<BaseProps> {
  static create(props: BaseProps, id?: UniqueEntityID) {
    const base = new Base(props, id);
    return base;
  }

  get name(): string {
    return this.props.name;
  }
  set name(name: string) {
    this.props.name = name;
  }
  get companyId(): UniqueEntityID {
    return this.props.companyId;
  }
}
