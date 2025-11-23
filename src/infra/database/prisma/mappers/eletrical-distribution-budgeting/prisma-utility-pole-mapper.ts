import { UtilityPole as PrismaUtilityPole } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { UtilityPole as DomainUtilityPole } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/utility-pole";

export class PrismaUtilityPoleMapper {
  static toDomain(raw: PrismaUtilityPole): DomainUtilityPole {
    return DomainUtilityPole.create(
      {
        code: raw.code,
        description: raw.description,
        unit: raw.unit,
        strongSideSectionMultiplier: raw.strongSideSectionMultiplier,
        mediumVoltageLevelsCount: raw.mediumVoltageLevelsCount,
        mediumVoltageStartSectionLengthInMM:
          raw.mediumVoltageStartSectionLengthInMM,
        mediumVoltageSectionLengthAddBylevelInMM:
          raw.mediumVoltageSectionLengthAddBylevelInMM,
        lowVoltageLevelsCount: raw.lowVoltageLevelsCount,
        lowVoltageStartSectionLengthInMM: raw.lowVoltageStartSectionLengthInMM,
        lowVoltageSectionLengthAddBylevelInMM:
          raw.lowVoltageSectionLengthAddBylevelInMM,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(utilityPole: DomainUtilityPole): PrismaUtilityPole {
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
