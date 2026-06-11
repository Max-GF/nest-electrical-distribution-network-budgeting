import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { TensionLevel } from "./value-objects/tension-level";

export interface CableProps {
  code: number;
  description: string;
  unit: "M" | "KG";

  tension: TensionLevel;
  sectionAreaInMM: number;

  meterToKgConversionFactor?: number;
}

export class Cable extends Entity<CableProps> {
  static create(props: CableProps, id?: UniqueEntityID) {
    const cable = new Cable(props, id);
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
  get unit(): "M" | "KG" {
    return this.props.unit;
  }
  set unit(unit: "M" | "KG") {
    this.props.unit = unit;
  }
  get tension(): TensionLevel {
    return this.props.tension;
  }
  set tension(tension: TensionLevel) {
    this.props.tension = tension;
  }
  get sectionAreaInMM(): number {
    return this.props.sectionAreaInMM;
  }
  set sectionAreaInMM(sectionAreaInMM: number) {
    this.props.sectionAreaInMM = sectionAreaInMM;
  }
  get meterToKgConversionFactor(): number | undefined {
    return this.props.meterToKgConversionFactor;
  }
  set meterToKgConversionFactor(meterToKgConversionFactor: number | undefined) {
    this.props.meterToKgConversionFactor = meterToKgConversionFactor;
  }
}
