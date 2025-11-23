import { Entity } from "src/core/entities/entity";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";

export interface UtilityPoleProps {
  code: number;
  description: string;
  unit: string;

  strongSideSectionMultiplier: number;

  mediumVoltageLevelsCount: number;
  mediumVoltageStartSectionLengthInMM: number;
  mediumVoltageSectionLengthAddBylevelInMM: number;

  lowVoltageLevelsCount: number;
  lowVoltageStartSectionLengthInMM: number;
  lowVoltageSectionLengthAddBylevelInMM: number;
}

export class UtilityPole extends Entity<UtilityPoleProps> {
  static create(props: UtilityPoleProps, id?: UniqueEntityID) {
    const utilitypole = new UtilityPole(props, id);
    return utilitypole;
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
  get strongSideSectionMultiplier(): number {
    return this.props.strongSideSectionMultiplier;
  }
  set strongSideSectionMultiplier(strongSideSectionMultiplier: number) {
    this.props.strongSideSectionMultiplier = strongSideSectionMultiplier;
  }
  get mediumVoltageLevelsCount(): number {
    return this.props.mediumVoltageLevelsCount;
  }
  set mediumVoltageLevelsCount(mediumVoltageLevelsCount: number) {
    this.props.mediumVoltageLevelsCount = mediumVoltageLevelsCount;
  }
  get mediumVoltageStartSectionLengthInMM(): number {
    return this.props.mediumVoltageStartSectionLengthInMM;
  }
  set mediumVoltageStartSectionLengthInMM(
    mediumVoltageStartSectionLengthInMM: number,
  ) {
    this.props.mediumVoltageStartSectionLengthInMM =
      mediumVoltageStartSectionLengthInMM;
  }
  get mediumVoltageSectionLengthAddBylevelInMM(): number {
    return this.props.mediumVoltageSectionLengthAddBylevelInMM;
  }
  set mediumVoltageSectionLengthAddBylevelInMM(
    mediumVoltageSectionLengthAddBylevelInMM: number,
  ) {
    this.props.mediumVoltageSectionLengthAddBylevelInMM =
      mediumVoltageSectionLengthAddBylevelInMM;
  }
  get lowVoltageLevelsCount(): number {
    return this.props.lowVoltageLevelsCount;
  }
  set lowVoltageLevelsCount(lowVoltageLevelsCount: number) {
    this.props.lowVoltageLevelsCount = lowVoltageLevelsCount;
  }
  get lowVoltageStartSectionLengthInMM(): number {
    return this.props.lowVoltageStartSectionLengthInMM;
  }
  set lowVoltageStartSectionLengthInMM(
    lowVoltageStartSectionLengthInMM: number,
  ) {
    this.props.lowVoltageStartSectionLengthInMM =
      lowVoltageStartSectionLengthInMM;
  }
  get lowVoltageSectionLengthAddBylevelInMM(): number {
    return this.props.lowVoltageSectionLengthAddBylevelInMM;
  }
  set lowVoltageSectionLengthAddBylevelInMM(
    lowVoltageSectionLengthAddBylevelInMM: number,
  ) {
    this.props.lowVoltageSectionLengthAddBylevelInMM =
      lowVoltageSectionLengthAddBylevelInMM;
  }

  calculateSectionLengthInMM(level: number, tension: "MEDIUM" | "LOW"): number {
    if (tension === "MEDIUM") {
      if (level < 1 || level > this.mediumVoltageLevelsCount) {
        throw new Error("Invalid medium voltage level");
      }
      return (
        this.props.mediumVoltageStartSectionLengthInMM +
        this.props.mediumVoltageSectionLengthAddBylevelInMM * (level - 1)
      );
    } else {
      if (level < 1 || level > this.lowVoltageLevelsCount) {
        throw new Error("Invalid low voltage level");
      }
      return (
        this.props.lowVoltageStartSectionLengthInMM +
        this.props.lowVoltageSectionLengthAddBylevelInMM * (level - 1)
      );
    }
  }
}
