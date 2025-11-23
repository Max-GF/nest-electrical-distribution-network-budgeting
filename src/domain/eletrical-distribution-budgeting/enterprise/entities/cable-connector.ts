import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface CableConnectorProps {
  code: number;
  description: string;
  unit: string;

  entranceMinValueMM: number;
  entranceMaxValueMM: number;

  exitMinValueMM: number;
  exitMaxValueMM: number;
}

export class CableConnector extends Entity<CableConnectorProps> {
  static create(props: CableConnectorProps, id?: UniqueEntityID) {
    const cable = new CableConnector(props, id);
    return cable;
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
  get unit(): string {
    return this.props.unit;
  }
  set unit(unit: string) {
    this.props.unit = unit;
  }
  get entranceMinValueMM(): number {
    return this.props.entranceMinValueMM;
  }
  set entranceMinValueMM(value: number) {
    this.props.entranceMinValueMM = value;
  }
  get entranceMaxValueMM(): number {
    return this.props.entranceMaxValueMM;
  }
  set entranceMaxValueMM(value: number) {
    this.props.entranceMaxValueMM = value;
  }
  get exitMinValueMM(): number {
    return this.props.exitMinValueMM;
  }
  set exitMinValueMM(value: number) {
    this.props.exitMinValueMM = value;
  }
  get exitMaxValueMM(): number {
    return this.props.exitMaxValueMM;
  }
  set exitMaxValueMM(value: number) {
    this.props.exitMaxValueMM = value;
  }
}
