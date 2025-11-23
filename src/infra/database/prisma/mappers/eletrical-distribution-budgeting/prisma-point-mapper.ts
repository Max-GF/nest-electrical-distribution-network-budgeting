import {
  Cable as PrismaCable,
  Point as PrismaPoint,
  Project as PrismaProject,
  UtilityPole as PrismaUtilityPole,
} from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { Point as DomainPoint } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/point";
import { PointWithDetails as DomainPointWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/point-with-details";
import { PrismaCableMapper } from "./prisma-cable-mapper";
import { PrismaProjectMapper } from "./prisma-project-mapper";
import { PrismaUtilityPoleMapper } from "./prisma-utility-pole-mapper";

type PrismaPointWithDetails = PrismaPoint & {
  project: PrismaProject;
  mediumTensionEntranceCable: PrismaCable | null;
  mediumTensionExitCable: PrismaCable | null;
  lowTensionEntranceCable: PrismaCable | null;
  lowTensionExitCable: PrismaCable | null;
  utilityPole: PrismaUtilityPole | null;
};
export class PrismaPointMapper {
  static toDomain(raw: PrismaPoint): DomainPoint {
    return DomainPoint.create(
      {
        name: raw.name,
        description: raw.description ?? undefined,
        projectId: new UniqueEntityID(raw.projectId),
        mediumTensionEntranceCableId: raw.mediumTensionEntranceCableId
          ? new UniqueEntityID(raw.mediumTensionEntranceCableId)
          : undefined,
        mediumTensionExitCableId: raw.mediumTensionExitCableId
          ? new UniqueEntityID(raw.mediumTensionExitCableId)
          : undefined,
        lowTensionEntranceCableId: raw.lowTensionEntranceCableId
          ? new UniqueEntityID(raw.lowTensionEntranceCableId)
          : undefined,
        lowTensionExitCableId: raw.lowTensionExitCableId
          ? new UniqueEntityID(raw.lowTensionExitCableId)
          : undefined,
        utilityPoleId: raw.utilityPoleId
          ? new UniqueEntityID(raw.utilityPoleId)
          : undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }
  static toDomainWithDetails(
    raw: PrismaPointWithDetails,
  ): DomainPointWithDetails {
    return DomainPointWithDetails.create({
      id: new UniqueEntityID(raw.id),
      name: raw.name,
      description: raw.description ?? undefined,
      project: PrismaProjectMapper.toDomain(raw.project),
      mediumTensionEntranceCable: raw.mediumTensionEntranceCable
        ? PrismaCableMapper.toDomain(raw.mediumTensionEntranceCable)
        : undefined,
      mediumTensionExitCable: raw.mediumTensionExitCable
        ? PrismaCableMapper.toDomain(raw.mediumTensionExitCable)
        : undefined,
      lowTensionEntranceCable: raw.lowTensionEntranceCable
        ? PrismaCableMapper.toDomain(raw.lowTensionEntranceCable)
        : undefined,
      lowTensionExitCable: raw.lowTensionExitCable
        ? PrismaCableMapper.toDomain(raw.lowTensionExitCable)
        : undefined,
      utilityPole: raw.utilityPole
        ? PrismaUtilityPoleMapper.toDomain(raw.utilityPole)
        : undefined,
    });
  }

  static toPrisma(point: DomainPoint): PrismaPoint {
    return {
      id: point.id.toString(),
      name: point.name,
      description: point.description ?? null,
      projectId: point.projectId.toString(),
      mediumTensionEntranceCableId:
        point.mediumTensionEntranceCableId?.toString() ?? null,
      mediumTensionExitCableId:
        point.mediumTensionExitCableId?.toString() ?? null,
      lowTensionEntranceCableId:
        point.lowTensionEntranceCableId?.toString() ?? null,
      lowTensionExitCableId: point.lowTensionExitCableId?.toString() ?? null,
      utilityPoleId: point.utilityPoleId?.toString() ?? null,
    };
  }
}
