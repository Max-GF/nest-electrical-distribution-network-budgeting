import { Cable as PrismaCable } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Cable as DomainCable } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";

export class PrismaCableMapper {
  static toDomain(raw: PrismaCable): DomainCable {
    return DomainCable.create(
      {
        code: raw.code,
        description: raw.description,
        unit: raw.unit,
        tension: TensionLevel.create(raw.tension),
        sectionAreaInMM: raw.sectionAreaInMM,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(cable: DomainCable): PrismaCable {
    return {
      id: cable.id.toString(),
      code: cable.code,
      description: cable.description,
      unit: cable.unit,
      tension: cable.tension.value,
      sectionAreaInMM: cable.sectionAreaInMM,
    };
  }
}
