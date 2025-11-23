import { Base as PrismaBase } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Base as DomainBase } from "src/domain/user-management/enterprise/entities/base";

export class PrismaBaseMapper {
  static toDomain(raw: PrismaBase): DomainBase {
    return DomainBase.create(
      {
        name: raw.name,
        companyId: new UniqueEntityID(raw.companyId),
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toPrisma(raw: DomainBase): PrismaBase {
    return {
      id: raw.id.toString(),
      name: raw.name,
      companyId: raw.companyId.toString(),
    };
  }
}
