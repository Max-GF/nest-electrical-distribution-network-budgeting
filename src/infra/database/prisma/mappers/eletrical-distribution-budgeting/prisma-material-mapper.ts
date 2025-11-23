import { Material as PrismaMaterial } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Material as DomainMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/material";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";

export class PrismaMaterialMapper {
  static toDomain(raw: PrismaMaterial): DomainMaterial {
    return DomainMaterial.create(
      {
        code: raw.code,
        description: raw.description,
        unit: raw.unit,
        tension: TensionLevel.create(raw.tension),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(material: DomainMaterial): PrismaMaterial {
    return {
      id: material.id.toString(),
      code: material.code,
      description: material.description,
      unit: material.unit,
      tension: material.tension.value,
    };
  }
}
