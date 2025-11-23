import {
  Prisma,
  GroupItem as PrismaGroupItem,
  Material as PrismaMaterial,
} from "prisma/generated/client";
import { UniqueEntityID } from "src/core/entities/unique-entity-id";
import { GroupItem as DomainGroupItem } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/group-item";
import { GroupItemWithDetails as DomainGroupItemWithDetails } from "src/domain/eletrical-distribution-budgeting/enterprise/entities/value-objects/group-item-with-details";
import { PrismaMaterialMapper } from "./prisma-material-mapper";

export type PrismaGroupItemWithDetails = PrismaGroupItem & {
  material: PrismaMaterial | null;
};
export class PrismaGroupItemMapper {
  static toDomain(raw: PrismaGroupItem): DomainGroupItem {
    switch (raw.type) {
      case "material":
        return DomainGroupItem.createMaterial(
          {
            groupId: new UniqueEntityID(raw.groupId),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            materialId: new UniqueEntityID(raw.materialId!),
            quantity: raw.quantity,
            type: raw.type,
            addByPhase: raw.addByPhase,
            description: raw.description ?? undefined,
          },
          new UniqueEntityID(raw.id),
        );
      case "poleScrew":
        return DomainGroupItem.createPoleScrew(
          {
            groupId: new UniqueEntityID(raw.groupId),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            lengthAdd: raw.lengthAdd!,
            quantity: raw.quantity,
            type: raw.type,
            addByPhase: raw.addByPhase,
            description: raw.description ?? undefined,
          },
          new UniqueEntityID(raw.id),
        );
      case "cableConnector":
        return DomainGroupItem.createCableConnector(
          {
            groupId: new UniqueEntityID(raw.groupId),
            quantity: raw.quantity,
            type: raw.type,
            addByPhase: raw.addByPhase,
            description: raw.description ?? undefined,
            localCableSectionInMM: raw.localCableSectionInMM ?? 0,
            oneSideConnector: raw.oneSideConnector ?? undefined,
          },
          new UniqueEntityID(raw.id),
        );
      default:
        throw new Error(`Unknown group item type: ${raw.type}`);
    }
  }
  static toDomainWithDetails(
    raw: PrismaGroupItemWithDetails,
  ): DomainGroupItemWithDetails {
    switch (raw.type) {
      case "material":
        return DomainGroupItemWithDetails.createMaterial({
          groupItemId: new UniqueEntityID(raw.id),
          groupId: new UniqueEntityID(raw.groupId),

          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          material: PrismaMaterialMapper.toDomain(raw.material!),
          quantity: raw.quantity,
          type: raw.type,
          addByPhase: raw.addByPhase,
          description: raw.description ?? undefined,
        });
      case "poleScrew":
        return DomainGroupItemWithDetails.createPoleScrew({
          groupItemId: new UniqueEntityID(raw.id),
          groupId: new UniqueEntityID(raw.groupId),
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          lengthAdd: raw.lengthAdd!,
          quantity: raw.quantity,
          type: raw.type,
          addByPhase: raw.addByPhase,
          description: raw.description ?? undefined,
        });
      case "cableConnector":
        return DomainGroupItemWithDetails.createCableConnector({
          groupItemId: new UniqueEntityID(raw.id),
          groupId: new UniqueEntityID(raw.groupId),
          quantity: raw.quantity,
          type: raw.type,
          addByPhase: raw.addByPhase,
          description: raw.description ?? undefined,
          localCableSectionInMM: raw.localCableSectionInMM ?? 0,
          oneSideConnector: raw.oneSideConnector ?? undefined,
        });
      default:
        throw new Error(`Unknown group item type: ${raw.type}`);
    }
  }

  static toPrisma(
    groupItem: DomainGroupItem,
  ): Prisma.GroupItemUncheckedCreateInput {
    // "UncheckedCreateInput" Impede um erro de tipo com os campos ausentes
    const base = {
      id: groupItem.id.toString(),
      groupId: groupItem.groupId.toString(),
      quantity: groupItem.quantity,
      addByPhase: groupItem.addByPhase,
      description: groupItem.description,
      type: groupItem.type,
    };

    if (groupItem.type === "material") {
      return {
        ...base,
        materialId: groupItem.materialId.toString(),
      };
    } else if (groupItem.type === "poleScrew") {
      return {
        ...base,
        lengthAdd: groupItem.lengthAdd,
      };
    } else if (groupItem.type === "cableConnector") {
      return {
        ...base,
        localCableSectionInMM: groupItem.localCableSectionInMM,
        oneSideConnector: groupItem.oneSideConnector,
      };
    }

    throw new Error(`Unknown group item type: ${groupItem.type}`);
  }
}
