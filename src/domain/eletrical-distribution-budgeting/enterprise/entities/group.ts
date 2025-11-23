import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { TensionLevel } from "./value-objects/tension-level";

export interface GroupProps {
  name: string;
  description: string;
  tension: TensionLevel;
}

export class Group extends Entity<GroupProps> {
  static create(props: GroupProps, id?: UniqueEntityID) {
    const group = new Group(props, id);
    return group;
  }
  get name(): string {
    return this.props.name;
  }
  set name(name: string) {
    this.props.name = name;
  }
  get description(): string {
    return this.props.description;
  }
  set description(description: string) {
    this.props.description = description;
  }
  get tension(): TensionLevel {
    return this.props.tension;
  }
  set tension(tension: TensionLevel) {
    this.props.tension = tension;
  }
}
