import { ProjectMaterial as PrismaProjectMaterial } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { ProjectMaterial as DomainProjectMaterial } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/project-material";

export class PrismaProjectMaterialMapper {
  static toDomain(raw: PrismaProjectMaterial): DomainProjectMaterial {
    return DomainProjectMaterial.create(
      {
        projectId: new UniqueEntityID(raw.projectId),
        itemId: new UniqueEntityID(raw.itemId),
        itemType: raw.itemType as
          | "material"
          | "poleScrew"
          | "cableConnector"
          | "utilityPole"
          | "cable",
        quantity: raw.quantity,
        pointId: raw.pointId ? new UniqueEntityID(raw.pointId) : undefined,
        groupSpecs: raw.groupId
          ? {
              groupId: new UniqueEntityID(raw.groupId ?? undefined),
              utilityPoleLevel: raw.utilityPoleLevel ?? 0, // Se tudo estiver nos conformes, esse 0 não irá ocorrer
              tensionLevel: raw.tensionLevel as "LOW" | "MEDIUM",
            }
          : undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrisma(
    projectMaterial: DomainProjectMaterial,
  ): PrismaProjectMaterial {
    return {
      id: projectMaterial.id.toString(),
      projectId: projectMaterial.projectId.toString(),
      itemId: projectMaterial.itemId.toString(),
      itemType: projectMaterial.itemType,
      quantity: projectMaterial.quantity,
      pointId: projectMaterial.pointId?.toString() ?? null,
      groupId: projectMaterial.groupSpecs?.groupId.toString() ?? null,
      utilityPoleLevel: projectMaterial.groupSpecs?.utilityPoleLevel ?? null,
      tensionLevel: projectMaterial.groupSpecs?.tensionLevel ?? null,
    };
  }
}
