import { Prisma } from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { CableConnector as DomainCableConnector } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/cable-connector";

type PrismaCableConnectorWithRelations = Prisma.CableConnectorGetPayload<{
  include: {
    entranceCables: true;
    exitCables: true;
  };
}>;

export class PrismaCableConnectorMapper {
  static toDomain(
    raw: PrismaCableConnectorWithRelations,
  ): DomainCableConnector {
    return DomainCableConnector.create(
      {
        code: raw.code,
        description: raw.description,
        unit: raw.unit,
        entranceCablesOptionsIds: raw.entranceCables.map(
          (cable) => new UniqueEntityID(cable.id),
        ),
        exitCablesOptionsIds:
          raw.exitCables.length > 0
            ? raw.exitCables.map((cable) => new UniqueEntityID(cable.id))
            : undefined,
      },
      new UniqueEntityID(raw.id),
    );
  }

  static toPrismaCreate(
    cableConnector: DomainCableConnector,
  ): Prisma.CableConnectorCreateInput {
    return {
      id: cableConnector.id.toString(),
      code: cableConnector.code,
      description: cableConnector.description,
      unit: cableConnector.unit,

      entranceCables: {
        connect: cableConnector.entranceCablesOptionsIds.map((id) => ({
          id: id.toString(),
        })),
      },
      exitCables: cableConnector.exitCablesOptionsIds
        ? {
            connect: cableConnector.exitCablesOptionsIds.map((id) => ({
              id: id.toString(),
            })),
          }
        : undefined,
    };
  }
  static toPrismaUpdate(
    cableConnector: DomainCableConnector,
  ): Prisma.CableConnectorUpdateInput {
    return {
      id: cableConnector.id.toString(),
      code: cableConnector.code,
      description: cableConnector.description,
      unit: cableConnector.unit,

      entranceCables: {
        set: cableConnector.entranceCablesOptionsIds.map((id) => ({
          id: id.toString(),
        })),
      },
      exitCables: {
        set:
          cableConnector.exitCablesOptionsIds?.map((id) => ({
            id: id.toString(),
          })) || [],
      },
    };
  }
}
