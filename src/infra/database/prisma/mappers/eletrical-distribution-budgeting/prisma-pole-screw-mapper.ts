import { PoleScrew as PrismaPoleScrew } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { PoleScrew as DomainPoleScrew } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/pole-screw";

export class PrismaPoleScrewMapper {
  static toDomain(raw: PrismaPoleScrew): DomainPoleScrew {
    return DomainPoleScrew.create(
      {
        code: raw.code,
        description: raw.description,
        unit: raw.unit,
        lengthInMM: raw.lengthInMM,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(poleScrew: DomainPoleScrew): PrismaPoleScrew {
    return {
      id: poleScrew.id.toString(),
      code: poleScrew.code,
      description: poleScrew.description,
      unit: poleScrew.unit,
      lengthInMM: poleScrew.lengthInMM,
    };
  }
}
