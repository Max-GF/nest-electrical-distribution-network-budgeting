import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface PoleScrewProps {
  code: number;
  description: string;
  unit: string;

  lengthInMM: number;
}

export class PoleScrew extends Entity<PoleScrewProps> {
  static create(props: PoleScrewProps, id?: UniqueEntityID) {
    const poleScrew = new PoleScrew(props, id);
    return poleScrew;
  }
  get code(): number {
    return this.props.code;
  }
  get description(): string {
    return this.props.description;
  }
  set description(description: string) {
    this.props.description = description;
  }
  get lengthInMM(): number {
    return this.props.lengthInMM;
  }
  set lengthInMM(lengthInMM: number) {
    this.props.lengthInMM = lengthInMM;
  }
  get unit(): string {
    return this.props.unit;
  }
  set unit(value: string) {
    this.props.unit = value;
  }
}
