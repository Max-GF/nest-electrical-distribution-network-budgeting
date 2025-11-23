import { Group as PrismaGroup } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Group as DomainGroup } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group";
import { TensionLevel } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/tension-level";

export class PrismaGroupMapper {
  static toDomain(raw: PrismaGroup): DomainGroup {
    return DomainGroup.create(
      {
        name: raw.name,
        description: raw.description,
        tension: TensionLevel.create(raw.tension),
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(group: DomainGroup): PrismaGroup {
    return {
      id: group.id.toString(),
      name: group.name,
      description: group.description,
      tension: group.tension.value,
    };
  }
}
