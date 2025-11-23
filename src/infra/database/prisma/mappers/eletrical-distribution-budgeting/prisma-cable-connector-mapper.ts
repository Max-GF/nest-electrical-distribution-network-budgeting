import { CableConnector as PrismaCableConnector } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { CableConnector as DomainCableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";

export class PrismaCableConnectorMapper {
  static toDomain(raw: PrismaCableConnector): DomainCableConnector {
    return DomainCableConnector.create(
      {
        code: raw.code,
        description: raw.description,
        unit: raw.unit,
        entranceMinValueMM: raw.entranceMinValueMM,
        entranceMaxValueMM: raw.entranceMaxValueMM,
        exitMinValueMM: raw.exitMinValueMM,
        exitMaxValueMM: raw.exitMaxValueMM,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(cableConnector: DomainCableConnector): PrismaCableConnector {
    return {
      id: cableConnector.id.toString(),
      code: cableConnector.code,
      description: cableConnector.description,
      unit: cableConnector.unit,
      entranceMinValueMM: cableConnector.entranceMinValueMM,
      entranceMaxValueMM: cableConnector.entranceMaxValueMM,
      exitMinValueMM: cableConnector.exitMinValueMM,
      exitMaxValueMM: cableConnector.exitMaxValueMM,
    };
  }
}
