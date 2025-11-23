import { UtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";

export class UtilityPolePresenter {
  static toHttp(utilityPole: UtilityPole) {
    return {
      id: utilityPole.id.toString(),
      code: utilityPole.code,
      description: utilityPole.description,
      unit: utilityPole.unit,
      strongSideSectionMultiplier: utilityPole.strongSideSectionMultiplier,
      mediumVoltageLevelsCount: utilityPole.mediumVoltageLevelsCount,
      mediumVoltageStartSectionLengthInMM:
        utilityPole.mediumVoltageStartSectionLengthInMM,
      mediumVoltageSectionLengthAddBylevelInMM:
        utilityPole.mediumVoltageSectionLengthAddBylevelInMM,
      lowVoltageLevelsCount: utilityPole.lowVoltageLevelsCount,
      lowVoltageStartSectionLengthInMM:
        utilityPole.lowVoltageStartSectionLengthInMM,
      lowVoltageSectionLengthAddBylevelInMM:
        utilityPole.lowVoltageSectionLengthAddBylevelInMM,
    };
  }
}
